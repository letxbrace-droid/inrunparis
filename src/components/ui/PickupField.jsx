import useBookingStore from '../../store/useBookingStore'

/**
 * « Jeudi 9 oct. · 18:30 » plutôt que « 2026-10-09T18:30 ».
 *
 * Aujourd'hui et demain sont nommés : c'est ce que dit un humain, et c'est ce
 * qui rassure le plus vite quand on relit sa réservation avant de valider.
 */
export function formatPickup(value) {
  if (!value) return 'Choisir une date et une heure'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return 'Choisir une date et une heure'

  const midnight = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const days = Math.round((midnight(d) - midnight(new Date())) / 86400000)
  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (days === 0) return `Aujourd'hui · ${heure}`
  if (days === 1) return `Demain · ${heure}`
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} · ${heure}`
}

/**
 * La ligne « prise en charge », partagée par les deux entrées du parcours.
 *
 * Elle existait en double — dans la pastille d'accueil et dans la feuille de
 * réservation — avec déjà deux bordures différentes et deux messages d'erreur
 * différents. Deux copies d'un même champ finissent toujours par diverger, et
 * celle qu'on corrige n'est jamais celle que le client regarde.
 *
 * Au repos, c'était un <input type="datetime-local"> nu : il affichait le
 * gabarit du navigateur — « mm/dd/yyyy, --:-- -- » — dans la langue du système
 * et pas dans celle de l'app, sans libellé, sans ressembler à rien d'autre à
 * l'écran. Aucune application native ne montre ça.
 *
 * Le champ natif reste, transparent par-dessus la ligne : c'est lui qu'on
 * touche, donc c'est le vrai sélecteur du téléphone qui s'ouvre — roue iOS,
 * calendrier Android. On n'écrit pas un sélecteur de date, on habille son
 * état au repos.
 */
export default function PickupField({ th, pickup, highlight = false, hint, iconSize = 16 }) {
  return (
    <div>
      <div
        className="relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200"
        style={{
          background: th.bgInput,
          border: highlight
            ? '1px solid color-mix(in srgb, var(--accent) 45%, transparent)'
            : `1px solid ${th.border}`,
          boxShadow: highlight
            ? '0 0 0 3px color-mix(in srgb, var(--accent) 8%, transparent)'
            : undefined,
        }}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none"
          stroke={highlight ? '#FF5A1F' : 'color-mix(in srgb, var(--accent) 55%, transparent)'}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>

        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
                        textTransform: 'uppercase', color: th.inkDim }}>
            Prise en charge
          </div>
          <div style={{ fontSize: 14, fontWeight: pickup ? 600 : 400, marginTop: 1,
                        color: pickup ? th.inkHigh : th.inkDim,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatPickup(pickup)}
          </div>
        </div>

        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
          stroke={th.inkDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0 }}>
          <path d="M9 18l6-6-6-6"/>
        </svg>

        <input
          type="datetime-local"
          value={pickup ?? ''}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(e) => useBookingStore.getState().setPickup(e.target.value || null)}
          className="absolute inset-0 w-full h-full opacity-0"
          style={{ colorScheme: th.inputScheme }}
          aria-label="Date et heure de prise en charge"
          aria-required="true"
        />
      </div>

      {highlight && hint && (
        <p className="text-xs px-1 mt-1.5" style={{ color: 'color-mix(in srgb, var(--accent) 80%, transparent)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}
