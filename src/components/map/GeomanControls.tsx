import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { setMapRef } from '../../store/map-store'
import { managerAtom, store } from '../../store/global-store'
import { Layer } from 'leaflet'

export const onEdit = (layer: Layer) => {
    console.log('Modification d’un layer :', layer)

    // Récupère l'id stocké sur le layer (ex: layer.options.storeId)
    const id = layer.options.bloomeoId
    if (!id) return

    // Récupère les nouvelles coordonnées GeoJSON
    const geojson = (layer as any).toGeoJSON()

    // Met à jour l'objet dans l'atom
    store.set(managerAtom, (items) => ({
        ...items,
        [id]: {
            ...items[id]!,
            geo: geojson,
        },
    }))
}
export default function GeomanControls() {
    const map = useMap()
    setMapRef(map) // Store the map reference globally

    useEffect(() => {
        if (!map.pm) {
            return
        }
        // Ajouter les contrôles Geoman (tout désactivé ici)
        map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawPolygon: false,
            drawRectangle: false,
            drawPolyline: false,
            drawCircle: false,
            drawText: false,
            drawCircleMarker: false,
            editMode: true,
            dragMode: true,
            cutPolygon: true,
            removalMode: true,
        })
        // Exemple : écouter la création d’une nouvelle couche
        // map.on('pm:create', (e) => {
        //     console.log('Objet dessiné :', e)
        //     // Tu peux ici par exemple récupérer le GeoJSON
        //     const geojson = e.layer.toGeoJSON()
        //     console.log('GeoJSON :', geojson)
        // })

        const onEdit = (e: any) => {
            // console.log('Modification d’un objet :', e)
            e.layers.eachLayer((layer: Layer) => {
                // console.log('Modification d’un layer :', layer)

                // Récupère l'id stocké sur le layer (ex: layer.options.storeId)
                const id = layer.options.bloomeoId
                if (!id) return

                // Récupère les nouvelles coordonnées GeoJSON
                const geojson = (layer as any).toGeoJSON()

                // Met à jour l'objet dans l'atom
                store.set(managerAtom, (items) => ({
                    ...items,
                    [id]: {
                        ...items[id]!,
                        geo: geojson,
                    },
                }))
            })
        }

        map.on('pm:edit', onEdit)
        return () => {
            map.pm.removeControls()
            map.off('pm:edit')
        }
    }, [map])

    return null
}
