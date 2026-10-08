import { useRef, useState, useEffect, useCallback } from 'react'
import useAppTheme from '../../hooks/useAppTheme'

const EDGE = 28          // largeur de la zone de départ du geste, en px
const DISMISS = 0.32     // fraction de l'écran au-delà de laquelle on ferme
const FLICK = 0.45       // px/ms : un geste rapide ferme même sans distance

/**
 * Une vue poussée par-dessus l'accueil, et le geste pour en revenir.
 *
 * Les cinq vues plein écran portaient chacune leur propre copie du même bloc :
 * même translateX(100%), mêmes deux courbes, mêmes attributs ARIA. Cinq copies
 * d'une même mécanique de navigation, donc cinq endroits à corriger et un seul
 * qu'on pense à corriger.
 *
 * Ce qui manquait n'était pas l'animation — elles glissaient déjà depuis la
 * droite — mais le GESTE. Sur iOS, revenir en arrière ne se fait pas en visant
 * une flèche de 44 px en haut à gauche : on tire depuis le bord de l'écran, et
 * la vue suit le doigt. Une application où ce geste ne répond pas est reconnue
 * comme « pas native » avant même qu'on sache pourquoi.
 *
 * Le geste ne démarre que dans les 28 premiers pixels : ailleurs, le doigt
 * appartient au contenu qui défile.
 */
export default function PushView({ open, onClose, label, children }) {
  const th = useAppTheme()
  const [drag, setDrag] = useState(null)   // { x } pendant le glissement
  const start = useRef(null)

  // La couche d'accueil recule pendant que la vue avance — c'est cette
  // parallaxe qui fait lire une pile plutôt qu'un simple recouvrement.
  // Publiée en variable CSS plutôt qu'en prop : elle change à chaque frame du
  // geste, et aucun composant n'a besoin de se re-rendre pour ça.
  useEffect(() => {
    const el = document.documentElement
    const w = window.innerWidth || 1
    const progress = open ? 1 - Math.min(Math.max((drag?.x ?? 0) / w, 0), 1) : 0
    el.style.setProperty('--push-in', String(progress))
    return () => { if (!open) el.style.setProperty('--push-in', '0') }
  }, [open, drag])

  const onPointerDown = useCallback((e) => {
    if (!open || e.clientX > EDGE) return
    start.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }, [open])

  const onPointerMove = useCallback((e) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    // Un geste franchement vertical appartient au défilement, pas au retour.
    if (drag === null && Math.abs(dy) > Math.abs(dx)) { start.current = null; return }
    setDrag({ x: Math.max(0, dx) })
  }, [drag])

  const end = useCallback((e) => {
    if (!start.current) return
    const dx = Math.max(0, e.clientX - start.current.x)
    const dt = Math.max(1, performance.now() - start.current.t)
    const w = window.innerWidth || 1
    start.current = null
    setDrag(null)
    if (dx / w > DISMISS || dx / dt > FLICK) onClose?.()
  }, [onClose])

  const dragging = drag !== null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!open}
      className="fixed inset-0 z-[80] flex flex-col will-change-transform"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      style={{
        background: th.bgBase,
        transform: open ? `translateX(${drag?.x ?? 0}px)` : 'translateX(100%)',
        visibility: open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        // Pendant le glissement il n'y a pas de transition : la vue doit coller
        // au doigt. Elle revient quand on lâche.
        transition: dragging
          ? 'none'
          : open
            ? 'transform .34s cubic-bezier(.16,1,.3,1), visibility 0s linear 0s'
            : 'transform .28s cubic-bezier(.55,0,.1,1), visibility 0s linear .28s',
        // L'ombre portée sur le bord gauche : sans elle, une vue qu'on tire
        // ressemble à un calque qui se décolle, pas à une page au-dessus d'une
        // autre.
        boxShadow: open ? '-18px 0 44px -12px rgba(0,0,0,.72)' : 'none',
      }}
    >
      {children}
    </div>
  )
}
