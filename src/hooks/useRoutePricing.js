import { useEffect } from 'react'
import useOSRM from './useOSRM'
import useBookingStore from '../store/useBookingStore'
import { computePriceForBooking } from '../utils/priceEngine'

/**
 * L'itinéraire et son tarif, calculés au même endroit pour tout le monde.
 *
 * Cette logique existait en deux exemplaires — dans la pastille d'accueil et
 * dans l'étape 1 de la feuille — et les deux copies avaient déjà divergé là où
 * ça coûte le plus cher : les dépendances de l'effet.
 *
 * Côté pastille, le prix était calculé une seule fois, quand l'itinéraire
 * arrivait, avec `pickup` encore nul. Or computePriceForBooking() se sert de
 * l'heure de prise en charge pour décider du tarif de nuit, et sans heure il
 * retombe sur l'heure COURANTE. Le client choisissait ensuite son horaire et
 * le prix ne bougeait plus.
 *
 * Mesuré sur Charonne → CDG : 56 € de jour, 63 € de nuit. Quelqu'un qui
 * réserve à 2 h du matin pour le lendemain 14 h voyait donc 63 € — sept euros
 * de trop — et l'inverse, réserver en journée pour 23 h, facturait le tarif de
 * jour. Sur une app dont la promesse tient en « prix fixe, annoncé avant le
 * départ », c'est la pire erreur possible.
 *
 * La correction tient dans la séparation : l'itinéraire dépend des deux points
 * et d'eux seuls ; le tarif dépend de l'itinéraire, de l'heure et du véhicule.
 * Changer l'heure recalcule le prix sans refaire un appel réseau.
 */
export default function useRoutePricing() {
  const depart = useBookingStore((s) => s.depart)
  const arrive = useBookingStore((s) => s.arrive)
  const pickup = useBookingStore((s) => s.pickup)
  const vehicleType = useBookingStore((s) => s.vehicleType)
  const setPrice = useBookingStore((s) => s.setPrice)
  const setRouteGeometry = useBookingStore((s) => s.setRouteGeometry)

  const { route, loading, error, fetchRoute } = useOSRM()

  // 1. L'itinéraire — uniquement quand les extrémités changent.
  useEffect(() => {
    if (!depart || !arrive) return
    let cancelled = false
    fetchRoute(depart, arrive).then((result) => {
      if (cancelled || !result) return
      setRouteGeometry(result.geometry)
    })
    return () => { cancelled = true }
    // Les coordonnées, pas les objets : une recherche d'adresse renvoie un
    // nouvel objet pour le même point et relancerait l'appel pour rien.
  }, [depart?.lat, depart?.lng, arrive?.lat, arrive?.lng]) // eslint-disable-line

  // 2. Le tarif — dès que l'itinéraire, l'heure ou le véhicule change.
  useEffect(() => {
    if (!route || !depart || !arrive) return
    setPrice(computePriceForBooking(route.km, route.mins, { pickup, depart, arrive, vehicleType }))
  }, [route, pickup, vehicleType, depart, arrive, setPrice])

  return { route, loading, error, fetchRoute }
}
