/**
 * Règles Firestore I&N RUN — suite de vérification.
 *
 * Tourne contre l'émulateur Firestore, pas contre la production :
 *   npm run test:rules
 *
 * Ce qui est vérifié tient en une phrase : un partenaire voit ses courses et
 * rien d'autre, ne touche pas au prix, et ne peut pas se promouvoir.
 */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing'
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = await initializeTestEnvironment({
  projectId: 'demo-inrun',
  firestore: { host: '127.0.0.1', port: 8088, rules: readFileSync('firestore.rules', 'utf8') },
})

const OWNER = 'u-owner', KARIM = 'u-karim', NABIL = 'u-nabil', PARTI = 'u-parti'
const DEPOT = Timestamp.fromDate(new Date('2026-10-14T08:00:00Z'))
const PICKUP = Timestamp.fromDate(new Date('2026-10-15T18:30:00Z'))

const course = (over) => ({
  client: { nom: 'Mathieu', tel: '+33 6 12 34 56 78' },
  pickup: PICKUP,
  depart: { label: 'Issy-les-Moulineaux', lat: 48.82, lng: 2.27 },
  arrive: { label: 'Paris CDG', lat: 49.01, lng: 2.55 },
  km: 41, mins: 48, prixTtc: 72, paiement: 'Carte', prestations: ['Wi-Fi'],
  statut: 'a_confirmer', chauffeurId: null, source: 'hub',
  createdAt: DEPOT, majAt: DEPOT,
  ...over,
})

async function seed() {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'chauffeurs', OWNER), { prenom: 'Patron', nom: 'I&N', role: 'owner',   actif: true })
    await setDoc(doc(db, 'chauffeurs', KARIM), { prenom: 'Karim',  nom: 'Lefèvre', role: 'partner', actif: true,
                                                 tel: '+33 6 11 22 33 44', carteVtc: '075 99 88 777', societe: 'KL Prestige VTC' })
    await setDoc(doc(db, 'chauffeurs', NABIL), { prenom: 'Nabil',  nom: 'Benali',  role: 'partner', actif: true })
    await setDoc(doc(db, 'chauffeurs', PARTI), { prenom: 'Ancien', nom: 'Parti',   role: 'partner', actif: false })

    await setDoc(doc(db, 'courses', 'c-karim'),  course({ statut: 'assignee', chauffeurId: KARIM }))
    await setDoc(doc(db, 'courses', 'c-nabil'),  course({ statut: 'assignee', chauffeurId: NABIL }))
    await setDoc(doc(db, 'courses', 'c-parti'),  course({ statut: 'assignee', chauffeurId: PARTI }))
    await setDoc(doc(db, 'courses', 'c-depot'),  course({ statut: 'a_confirmer', source: 'pwa' }))
    await setDoc(doc(db, 'courses', 'c-conf'),   course({ statut: 'confirmee' }))
    await setDoc(doc(db, 'courses', 'c-accept'), course({ statut: 'acceptee', chauffeurId: KARIM }))
    await setDoc(doc(db, 'courses', 'c-route'),  course({ statut: 'en_route', chauffeurId: KARIM }))

    await setDoc(doc(db, 'documents', 'BDR-20261014-001'), { num: 'BDR-20261014-001', type: 'bdr', chauffeurId: KARIM, client: 'Mathieu', prixTtc: 72, emisAt: DEPOT })
    await setDoc(doc(db, 'documents', 'BDR-20261014-002'), { num: 'BDR-20261014-002', type: 'bdr', chauffeurId: NABIL, client: 'Sophie',  prixTtc: 54, emisAt: DEPOT })
    await setDoc(doc(db, 'compteurs', 'BDR'), { n: 5 })
    await setDoc(doc(db, 'promos', 'BIENVENUE'), { actif: true,  type: 'percent', montant: 10, libelle: '10% de bienvenue' })
    await setDoc(doc(db, 'promos', 'PERIME'),    { actif: false, type: 'percent', montant: 50, libelle: 'Expiré' })
  })
}

const as = (uid) => env.authenticatedContext(uid).firestore()
const anon = () => env.unauthenticatedContext().firestore()

let pass = 0, fail = 0
const results = []
async function t(label, expect, fn) {
  await seed()
  try {
    await (expect === 'ok' ? assertSucceeds(fn()) : assertFails(fn()))
    pass++; results.push(['✓', label])
  } catch (e) {
    fail++; results.push(['✗', `${label}  →  ${String(e.message).split('\n')[0].slice(0, 110)}`])
  }
}

// ───────────────────────── cloisonnement des chauffeurs ─────────────────────
await t('un partenaire lit sa propre fiche',                      'ok', () => getDoc(doc(as(KARIM), 'chauffeurs', KARIM)))
await t('un partenaire NE lit PAS la fiche d\'un autre (carte VTC, tél.)', 'ko', () => getDoc(doc(as(KARIM), 'chauffeurs', NABIL)))
await t('un partenaire NE liste PAS les chauffeurs',              'ko', () => getDocs(collection(as(KARIM), 'chauffeurs')))
await t('le propriétaire liste les chauffeurs',                   'ok', () => getDocs(collection(as(OWNER), 'chauffeurs')))
await t('un partenaire corrige son téléphone',                    'ok', () => updateDoc(doc(as(KARIM), 'chauffeurs', KARIM), { tel: '+33 6 00 00 00 00' }))
await t('un partenaire NE se promeut PAS propriétaire',           'ko', () => updateDoc(doc(as(KARIM), 'chauffeurs', KARIM), { role: 'owner' }))
await t('un partenaire NE se réactive PAS lui-même',              'ko', () => updateDoc(doc(as(PARTI), 'chauffeurs', PARTI), { actif: true }))
await t('un partenaire NE change PAS sa société',                 'ko', () => updateDoc(doc(as(KARIM), 'chauffeurs', KARIM), { societe: 'Autre SARL' }))
await t('un partenaire NE crée PAS de chauffeur',                 'ko', () => setDoc(doc(as(KARIM), 'chauffeurs', 'u-faux'), { prenom: 'Faux', role: 'owner', actif: true }))
await t('le propriétaire crée un chauffeur',                      'ok', () => setDoc(doc(as(OWNER), 'chauffeurs', 'u-neuf'), { prenom: 'Neuf', nom: 'Chauffeur', role: 'partner', actif: true }))
await t('un anonyme NE lit PAS une fiche chauffeur',              'ko', () => getDoc(doc(anon(), 'chauffeurs', KARIM)))

// ───────────────────────── lecture des courses ──────────────────────────────
await t('un partenaire lit la course qui lui est assignée',       'ok', () => getDoc(doc(as(KARIM), 'courses', 'c-karim')))
await t('un partenaire NE lit PAS la course d\'un autre',         'ko', () => getDoc(doc(as(KARIM), 'courses', 'c-nabil')))
await t('un partenaire interroge ses courses (requête filtrée)',  'ok', () => getDocs(query(collection(as(KARIM), 'courses'), where('chauffeurId', '==', KARIM))))
await t('un partenaire NE balaye PAS toutes les courses',         'ko', () => getDocs(collection(as(KARIM), 'courses')))
await t('un partenaire NE requête PAS les courses d\'un autre',   'ko', () => getDocs(query(collection(as(KARIM), 'courses'), where('chauffeurId', '==', NABIL))))
await t('un chauffeur désactivé perd l\'accès à ses courses',     'ko', () => getDoc(doc(as(PARTI), 'courses', 'c-parti')))
await t('le propriétaire lit toutes les courses',                 'ok', () => getDocs(collection(as(OWNER), 'courses')))
await t('un anonyme NE lit PAS une course',                       'ko', () => getDoc(doc(anon(), 'courses', 'c-depot')))

// ───────────────────────── dépôt public depuis la PWA ───────────────────────
const depot = (over) => ({
  client: { nom: 'Mathieu', tel: '+33 6 12 34 56 78' },
  pickup: PICKUP,
  depart: { label: 'Issy-les-Moulineaux', lat: 48.82, lng: 2.27 },
  arrive: { label: 'Paris CDG', lat: 49.01, lng: 2.55 },
  km: 41, mins: 48, prixTtc: 72, paiement: 'Carte', prestations: ['Wi-Fi'],
  statut: 'a_confirmer', chauffeurId: null, source: 'pwa',
  createdAt: serverTimestamp(), majAt: serverTimestamp(),
  ...over,
})
await t('la PWA dépose une demande en « à confirmer »',           'ok', () => setDoc(doc(anon(), 'courses', 'dep-1'), depot()))
await t('la PWA NE dépose PAS une course déjà confirmée',         'ko', () => setDoc(doc(anon(), 'courses', 'dep-2'), depot({ statut: 'confirmee' })))
await t('la PWA NE s\'assigne PAS un chauffeur',                  'ko', () => setDoc(doc(anon(), 'courses', 'dep-3'), depot({ chauffeurId: KARIM })))
await t('la PWA NE se déclare PAS comme venant du hub',           'ko', () => setDoc(doc(anon(), 'courses', 'dep-4'), depot({ source: 'hub' })))
await t('un prix hors bornes est refusé',                         'ko', () => setDoc(doc(anon(), 'courses', 'dep-5'), depot({ prixTtc: 99999 })))
await t('un prix non numérique est refusé',                       'ko', () => setDoc(doc(anon(), 'courses', 'dep-6'), depot({ prixTtc: '72' })))
await t('un champ inconnu est refusé',                            'ko', () => setDoc(doc(anon(), 'courses', 'dep-7'), depot({ bonNum: 'BDR-999', remise: 100 })))
await t('un nom client vide est refusé',                          'ko', () => setDoc(doc(anon(), 'courses', 'dep-8'), depot({ client: { nom: 'X' } })))
await t('une note à rallonge est refusée',                        'ko', () => setDoc(doc(anon(), 'courses', 'dep-9'), depot({ note: 'x'.repeat(501) })))
await t('un horodatage antidaté est refusé',                      'ko', () => setDoc(doc(anon(), 'courses', 'dep-10'), depot({ createdAt: DEPOT })))
await t('la PWA NE modifie PAS un dépôt existant',                'ko', () => updateDoc(doc(anon(), 'courses', 'c-depot'), { prixTtc: 1 }))

// ───────────────────────── cycle de vie de la course ────────────────────────
await t('le propriétaire valide un dépôt',                        'ok', () => updateDoc(doc(as(OWNER), 'courses', 'c-depot'), { statut: 'confirmee', majAt: serverTimestamp() }))
await t('le propriétaire refuse un dépôt',                        'ok', () => updateDoc(doc(as(OWNER), 'courses', 'c-depot'), { statut: 'refusee', majAt: serverTimestamp() }))
await t('le propriétaire assigne un chauffeur',                   'ok', () => updateDoc(doc(as(OWNER), 'courses', 'c-conf'), { statut: 'assignee', chauffeurId: KARIM }))
await t('assigner sans chauffeur est refusé',                     'ko', () => updateDoc(doc(as(OWNER), 'courses', 'c-conf'), { statut: 'assignee' }))
await t('réécrire l\'origine d\'une course est refusé',           'ko', () => updateDoc(doc(as(OWNER), 'courses', 'c-depot'), { source: 'hub' }))
await t('réécrire la date de dépôt est refusé',                   'ko', () => updateDoc(doc(as(OWNER), 'courses', 'c-depot'), { createdAt: serverTimestamp() }))
await t('le chauffeur accepte sa course',                         'ok', () => updateDoc(doc(as(KARIM), 'courses', 'c-karim'), { statut: 'acceptee', majAt: serverTimestamp() }))
await t('le chauffeur se met en route',                           'ok', () => updateDoc(doc(as(KARIM), 'courses', 'c-accept'), { statut: 'en_route', majAt: serverTimestamp() }))
await t('le chauffeur termine la course',                         'ok', () => updateDoc(doc(as(KARIM), 'courses', 'c-route'), { statut: 'terminee', majAt: serverTimestamp() }))
await t('le chauffeur rend la course (refus)',                    'ok', () => updateDoc(doc(as(KARIM), 'courses', 'c-karim'), { statut: 'confirmee', chauffeurId: null }))
await t('le chauffeur NE saute PAS « assignée » → « terminée »',  'ko', () => updateDoc(doc(as(KARIM), 'courses', 'c-karim'), { statut: 'terminee' }))
await t('le chauffeur NE touche PAS au prix',                     'ko', () => updateDoc(doc(as(KARIM), 'courses', 'c-karim'), { statut: 'acceptee', prixTtc: 150 }))
await t('le chauffeur NE change PAS la destination',              'ko', () => updateDoc(doc(as(KARIM), 'courses', 'c-karim'), { arrive: { label: 'Deauville' } }))
await t('le chauffeur NE prend PAS la course d\'un autre',        'ko', () => updateDoc(doc(as(KARIM), 'courses', 'c-nabil'), { statut: 'acceptee', chauffeurId: KARIM }))
await t('le chauffeur NE s\'assigne PAS un dépôt libre',          'ko', () => updateDoc(doc(as(KARIM), 'courses', 'c-depot'), { statut: 'assignee', chauffeurId: KARIM }))
await t('personne ne supprime une course (le propriétaire non plus)', 'ko', () => deleteDoc(doc(as(OWNER), 'courses', 'c-karim')))

// ───────────────────────── documents émis ───────────────────────────────────
await t('le propriétaire émet un document',                       'ok', () => setDoc(doc(as(OWNER), 'documents', 'BDR-20261014-003'), { num: 'BDR-20261014-003', type: 'bdr', chauffeurId: KARIM, client: 'Mathieu', prixTtc: 72, emisAt: serverTimestamp() }))
await t('un document émis NE se réécrit PAS (CGI art. 289)',      'ko', () => updateDoc(doc(as(OWNER), 'documents', 'BDR-20261014-001'), { prixTtc: 1 }))
await t('un document émis NE se supprime PAS',                    'ko', () => deleteDoc(doc(as(OWNER), 'documents', 'BDR-20261014-001')))
await t('un numéro incohérent est refusé',                        'ko', () => setDoc(doc(as(OWNER), 'documents', 'BDR-20261014-004'), { num: 'AUTRE', type: 'bdr', emisAt: serverTimestamp() }))
await t('le chauffeur relit son propre bon',                      'ok', () => getDoc(doc(as(KARIM), 'documents', 'BDR-20261014-001')))
await t('le chauffeur NE lit PAS le bon d\'un autre',             'ko', () => getDoc(doc(as(KARIM), 'documents', 'BDR-20261014-002')))

// ───────────────────────── compteurs de numérotation ────────────────────────
await t('le compteur avance de 1',                                'ok', () => updateDoc(doc(as(OWNER), 'compteurs', 'BDR'), { n: 6 }))
await t('le compteur NE saute PAS de numéros',                    'ko', () => updateDoc(doc(as(OWNER), 'compteurs', 'BDR'), { n: 12 }))
await t('le compteur NE recule PAS',                              'ko', () => updateDoc(doc(as(OWNER), 'compteurs', 'BDR'), { n: 4 }))
await t('un chauffeur NE lit PAS les compteurs',                  'ko', () => getDoc(doc(as(KARIM), 'compteurs', 'BDR')))

// ───────────────────────── codes promo ──────────────────────────────────────
await t('un client vérifie un code actif qu\'il connaît',         'ok', () => getDoc(doc(anon(), 'promos', 'BIENVENUE')))
await t('un code désactivé reste invisible',                      'ko', () => getDoc(doc(anon(), 'promos', 'PERIME')))
await t('les codes ne sont PAS énumérables',                      'ko', () => getDocs(collection(anon(), 'promos')))
await t('le propriétaire crée un code',                           'ok', () => setDoc(doc(as(OWNER), 'promos', 'AUTOMNE'), { actif: true, type: 'percent', montant: 15, libelle: 'Automne' }))
await t('un anonyme NE crée PAS de code',                         'ko', () => setDoc(doc(anon(), 'promos', 'GRATUIT'), { actif: true, type: 'percent', montant: 100 }))
await t('un partenaire NE crée PAS de code',                      'ko', () => setDoc(doc(as(KARIM), 'promos', 'KARIM100'), { actif: true, type: 'percent', montant: 100 }))

// ───────────────────────── collections hors schéma ──────────────────────────
await t('une collection inconnue est fermée, même au propriétaire', 'ko', () => setDoc(doc(as(OWNER), 'nimporte', 'x'), { a: 1 }))

for (const [mark, label] of results) console.log(`  ${mark} ${label}`)
console.log(`\n  ${pass} vérifications passées, ${fail} en échec`)
await env.cleanup()
process.exit(fail ? 1 : 0)
