/**
 * Les icônes d'interface, en tracé.
 *
 * Elles étaient en PNG : des illustrations de 96 px et ~2 000 couleurs,
 * affichées entre 13 et 22 px. À cette taille une illustration anti-aliasée
 * n'est plus lisible — c'est une tache qui a vaguement la bonne silhouette —
 * et elle coûte 12 à 20 Ko pour ça.
 *
 * Trois choses que le PNG ne pouvait pas faire et qui comptent ici :
 * suivre le thème clair/sombre, prendre la couleur d'accent quand l'option est
 * active, et rester net sur un écran à trois fois la densité.
 *
 * Les PNG de marque restent là où ils sont vraiment vus : la Swace à 248 px,
 * le sceau de confirmation à 108 px. Une illustration mérite d'être affichée
 * assez grand pour être regardée, ou pas du tout.
 */
const P = {
  // viewBox 24×24, tracé, extrémités rondes — un seul gabarit pour tout le jeu.
  home:     <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-6h5v6"/></>,
  work:     <><rect x="2.5" y="7" width="19" height="13.5" rx="2"/><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2"/><path d="M2.5 12.5h19"/></>,
  // Un avion vu de dessus, pas un avion en papier : le second est le
  // pictogramme universel de « envoyer », et il était posé à côté de « CDG ».
  plane:    <><path d="M12 2.5c1 0 1.7 1.1 1.7 2.6v3.6l7.3 4.3v2.1l-7.3-2.3v4.1l2.6 1.9v1.7L12 19.4l-4.3 1.2v-1.7l2.6-1.9v-4.1L3 15.2v-2.1l7.3-4.3V5.1c0-1.5.7-2.6 1.7-2.6Z"/></>,
  pin:      <><path d="M12 21.5s7-6.2 7-11.1A7 7 0 0 0 5 10.4c0 4.9 7 11.1 7 11.1Z"/><circle cx="12" cy="10.2" r="2.6"/></>,
  music:    <><path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></>,
  radio:    <><circle cx="12" cy="12" r="2.2"/><path d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 15.8a5.4 5.4 0 0 0 0-7.6"/><path d="M5.4 5.4a9.4 9.4 0 0 0 0 13.2M18.6 18.6a9.4 9.4 0 0 0 0-13.2"/></>,
  silence:  <><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></>,
  card:     <><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19"/><path d="M6 14.5h4"/></>,
  cash:     <><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/></>,
  transfer: <><path d="M4 8.5h13M13.5 5 17 8.5 13.5 12"/><path d="M20 15.5H7M10.5 12 7 15.5 10.5 19"/></>,
  wifi:     <><path d="M2.5 9.5a14 14 0 0 1 19 0"/><path d="M6 13a9 9 0 0 1 12 0"/><path d="M9.3 16.4a4.2 4.2 0 0 1 5.4 0"/><circle cx="12" cy="19.6" r="1.1" fill="currentColor" stroke="none"/></>,
  water:    <><path d="M9 2.5h6"/><path d="M9.5 2.5v3L7 9.2A4 4 0 0 0 6.3 11.5V19a2.5 2.5 0 0 0 2.5 2.5h6.4A2.5 2.5 0 0 0 17.7 19v-7.5A4 4 0 0 0 17 9.2l-2.5-3.7v-3"/><path d="M6.3 14.5h11.4"/></>,
  // Volume et température indiquent un ÉTAT. En PNG l'état ne se lisait qu'à
  // la silhouette, à 17 px ; en tracé, le nombre d'arcs et la couleur le
  // disent tous les deux.
  'volume-mute': <><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></>,
  'volume-low':  <><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15.2 9.8a3.6 3.6 0 0 1 0 4.4"/></>,
  'volume-high': <><path d="M11 5 6.5 9H3v6h3.5L11 19V5Z"/><path d="M15.2 9.8a3.6 3.6 0 0 1 0 4.4"/><path d="M18.4 7a7.6 7.6 0 0 1 0 10"/></>,
  thermometer:   <><path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4.2 4.2 0 1 0 4 0Z"/><path d="M12 9.5v6.2"/></>,
  charger:  <><path d="M9 2.5v5M15 2.5v5"/><path d="M6 7.5h12v4a6 6 0 0 1-6 6 6 6 0 0 1-6-6v-4Z"/><path d="M12 17.5v4"/></>,
}

export default function Icon({ name, size = 18, strokeWidth = 1.8, style, ...rest }) {
  const path = P[name]
  if (!path) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, display: 'block', ...style }}
      {...rest}
    >
      {path}
    </svg>
  )
}
