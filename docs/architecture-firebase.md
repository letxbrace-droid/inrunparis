# Firebase — app chauffeur, PWA client inchangée

État : **fondation posée et vérifiée, rien n'est encore branché.** Aucun projet
Firebase n'existe à ce jour. Les règles de sécurité ci-dessous tournent contre
l'émulateur et passent 63 vérifications sur 63 (`npm run test:rules`).

## Pourquoi deux apps

Le SDK Firebase pèse ~100 ko gzip après élagage. Le chemin critique de la PWA
client est à 39,5 ko : l'y ajouter le triplerait, et on a travaillé pour le
descendre. Dans l'app chauffeur, ce poids ne coûte rien — trois utilisateurs,
app installée, chargée une fois.

```
                     ┌──────────────────────────┐
  client ─────────── │  PWA (GitHub Pages)      │  aucun SDK Firebase
                     │  React, 39,5 ko critique │
                     └────────────┬─────────────┘
                                  │ POST /course   (la course part aussi en WhatsApp)
                                  ▼
                     ┌──────────────────────────┐
                     │  Worker Cloudflare       │  limite le débit, pas de secret
                     │  inrun-hub (existe déjà) │
                     └────────────┬─────────────┘
                                  │ REST, NON authentifié → les règles s'appliquent
                                  ▼
                     ┌──────────────────────────┐
  propriétaire ───── │  Firestore (eur3)        │
  (hub de gestion)   └────────────┬─────────────┘
                                  │ SDK + Auth
                                  ▼
                     ┌──────────────────────────┐
  partenaires ────── │  app chauffeur           │  Firebase Hosting
                     │  (Firebase Auth)         │
                     └──────────────────────────┘
```

**Le Worker écrit en non authentifié, délibérément.** Il n'embarque donc aucun
compte de service, et la validation du dépôt reste au seul endroit où elle est
testée : les règles. Le Worker n'apporte que ce que les règles ne savent pas
faire — limiter le débit par IP. (Un compte de service en ferait un
administrateur, contournerait les règles, et il faudrait dupliquer toute la
validation côté Worker.)

## Ce que les décisions ont fixé

- Les comptes chauffeurs sont **créés par le propriétaire**. Pas d'inscription
  ouverte. Auth par e-mail + mot de passe : l'auth par SMS est facturée et
  impose le forfait Blaze.
- Une course déposée par la PWA arrive en **`a_confirmer`** et n'existe
  vraiment qu'après validation dans le hub. Garde-fou contre les fausses
  réservations.
- Le WhatsApp de confirmation reste envoyé en parallèle : le tunnel qui marche
  aujourd'hui n'est pas touché.

## Modèle de données

### `chauffeurs/{uid}`
`prenom, nom, tel, carteVtc, vehicule, plaque, societe, role: 'owner'|'partner', actif: bool, defaut: bool`

`societe` vide = la nôtre ; remplie = chauffeur partenaire, et c'est elle qui
s'imprime sur le bon. Le `role` vit ici et nulle part ailleurs : un chauffeur
ne peut pas modifier son propre rôle, donc pas s'élever propriétaire.

Le téléphone et le n° de carte VTC d'un partenaire sont des **données
personnelles** : un partenaire ne lit que sa propre fiche, jamais celle d'un
autre. Vérifié.

### `courses/{id}`
`client{nom,tel,email}, pickup, depart{label,lat,lng}, arrive{…}, km, mins,
prixTtc, paiement, prestations[], note, statut, chauffeurId, source, createdAt, majAt`

```
                 ┌──> refusee
  a_confirmer ───┤
   (dépôt PWA)   └──> confirmee ──> assignee ──> acceptee ──> en_route ──> terminee
                          ▲             │
                          └─────────────┘  le chauffeur rend la course
```
`annulee` est accessible au propriétaire depuis n'importe quel état. Une course
ne se **supprime** jamais — traçabilité.

Le chauffeur ne peut changer que `statut`, `chauffeurId` et `majAt`, et
seulement par un pas légal du cycle : pas de saut `assignee → terminee`, pas de
retouche du prix ni de la destination. Vérifié.

### `documents/{num}`
Bons et factures, **figés à l'émission** : l'article 289 du CGI impose dix ans
de conservation, un document émis ne se réécrit ni ne se supprime. Un chauffeur
relit ses propres bons, pas ceux des autres.

### `compteurs/{serie}`
Numérotation `BDR-20261014-001`. L'incrément n'accepte que `n + 1` : une série
ne saute pas de numéro et ne recule pas. À faire en `runTransaction` côté
client — pas besoin de Cloud Function, donc on reste sur le palier gratuit.

### `promos/{code}`
`actif, type, montant, libelle`. **Lecture publique d'un code actif qu'on
connaît, énumération fermée.** C'est ce qui répare le bug actuel : aujourd'hui
`src/store/useBookingStore.js:23` lit `inr-promo-codes` dans le localStorage du
navigateur du client, alors que c'est le hub qui écrit cette clé — dans celui du
propriétaire. Un code créé dans le hub ne parvient à aucun client.

## Étapes

1. **Projet Firebase + migration du stock.** Créer le projet en région `eur3`,
   publier les règles, et faire passer le hub de `localStorage` à Firestore
   derrière une petite couche de stockage — le hub continue de fonctionner à
   l'identique, il lit et écrit juste ailleurs. Rien ne change pour les clients.
2. **App chauffeur.** Connexion, « mes courses », accepter / en route /
   terminé. C'est ce qui sert au partenaire qui prend une course.
3. **Dépôt depuis la PWA.** `POST /course` sur le Worker, file « à confirmer »
   dans le hub. Fin du coller-analyser WhatsApp.
4. **Codes promo en Firestore.** Le bug disparaît.
5. *(optionnel)* Remplacer le Gist GitHub qui stocke les abonnés push.

## Coût

Palier gratuit (Spark) : 50 000 lectures et 20 000 écritures par jour. Le volume
réel est de l'ordre de quelques centaines d'opérations. Pas de Cloud Function,
donc pas besoin de Blaze. Firebase Hosting est inclus.

Les `get()` des règles qui lisent la fiche du demandeur sont facturés comme des
lectures. À trois utilisateurs c'est sans effet ; si le nombre de chauffeurs
grandit, passer le rôle en *custom claim* du jeton supprime ces lectures.

## Points ouverts

- **Région `eur3` à la création du projet** — elle ne se change pas après. Le
  n° de carte VTC et le téléphone d'un partenaire sont des données
  personnelles, et Google devient sous-traitant : à inscrire au registre des
  traitements et à refléter dans les mentions légales.
- **Limitation de débit dans le Worker** avant d'ouvrir `/course` : les règles
  valident la *forme* d'un dépôt, elles ne savent pas compter les dépôts.
- **`createdAt == request.time`** est strict dans les règles. En REST non
  authentifié, soit le Worker utilise la transformation d'horodatage serveur,
  soit on relâche vers une fenêtre de quelques minutes. À trancher en étape 3.
- **Les erreurs d'évaluation dans les journaux de l'émulateur** sont normales :
  une règle qui cherche une fiche chauffeur inexistante lève au lieu de rendre
  `false`. Firestore refuse dans les deux cas — c'est son comportement
  documenté, et les 63 vérifications le confirment état par état.

## Vérifier

```bash
npm run test:rules     # émulateur Firestore + 63 assertions sur les règles
```
Aucun identifiant requis : l'émulateur tourne en local sur un projet `demo-`.
