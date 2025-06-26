import { IItem, itemAtom, singleSelectItem } from '../../../store/global-store'
import { useAtomValue } from 'jotai'
import { Polygon, Tooltip, useMap } from 'react-leaflet'
import { PlotInfo } from '../../../store/plot-store'
import { useEffect, useMemo, useRef, useState } from 'react'
import area from '@turf/area'
import { onEdit } from '../GeomanControls'

export default function Plot(props: { id: string }) {
    const ref = useRef<L.Polygon<any>>(null)
    const map = useMap()
    const [rerender, setRerender] = useState(0)
    // Pour forcer le recalcul lors d'un zoom ou déplacement
    const [mapZoom, setMapZoom] = useState(map.getZoom())
    const [mapCenter, setMapCenter] = useState(map.getCenter())
    useEffect(() => {
        const onZoom = () => setMapZoom(map.getZoom())
        const onMove = () => setMapCenter(map.getCenter())
        map.on('zoomlevelschange', onZoom)
        map.on('zoomend', onZoom)
        map.on('moveend', onMove)
        return () => {
            map.off('zoomlevelschange', onZoom)
            map.off('zoomend', onZoom)
            map.off('moveend', onMove)
        }
    }, [map])
    const value = useAtomValue(
        useMemo(() => itemAtom(props.id), [props.id])
    ) as IItem<PlotInfo>
    if (value.geo.geometry.type !== 'Polygon') {
        return null
    }
    const coordinates = useMemo(() => {
        const rawCoordinates = (value.geo.geometry as any)?.coordinates as any
        return rawCoordinates.map((ring: any) =>
            ring.map((point: any) => [point[1], point[0]])
        )
    }, [value.geo])
    const surface = useMemo(() => {
        return area({
            type: 'Feature',
            geometry: value.geo.geometry,
            properties: {},
        })
    }, [value.geo])

    // Calculer la taille du plot en pixels à l'écran (diagonale)
    const isVisible = useMemo(() => {
        if (!coordinates[0] || coordinates[0].length < 2) return false
        const bounds = coordinates[0]
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity
        for (const [lat, lng] of bounds) {
            const pt = map.latLngToContainerPoint([lat, lng])
            minX = Math.min(minX, pt.x)
            minY = Math.min(minY, pt.y)
            maxX = Math.max(maxX, pt.x)
            maxY = Math.max(maxY, pt.y)
        }
        const width = Math.abs(maxX - minX)
        const height = Math.abs(maxY - minY)
        // Utilise la diagonale réelle (distance pixel)
        const diag = Math.sqrt(width * width + height * height)
        if (diag < 10) return false // trop petit, on n'affiche rien
        return true
    }, [coordinates, mapZoom, mapCenter])

    const showText = useMemo(() => {
        if (!coordinates[0] || coordinates[0].length < 2) return false
        const bounds = coordinates[0]
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity
        for (const [lat, lng] of bounds) {
            const pt = map.latLngToContainerPoint([lat, lng])
            minX = Math.min(minX, pt.x)
            minY = Math.min(minY, pt.y)
            maxX = Math.max(maxX, pt.x)
            maxY = Math.max(maxY, pt.y)
        }
        const width = Math.abs(maxX - minX)
        const height = Math.abs(maxY - minY)
        const diag = Math.sqrt(width * width + height * height)
        if (diag < 80) return false // trop petit pour le texte
        return true
    }, [coordinates, mapZoom, mapCenter])

    useEffect(() => {
        ref.current?.on('pm:edit', (e) => {
            // console.log(e)
            onEdit(e.layer)
            setRerender((prev) => prev + 1) // Forcer le rerender après modification
        })

        return () => {
            ref.current?.off('pm:edit')
        }
    }, [])
    if (!isVisible) return null
    const color = value.selected ? '#00bbea' : '#0099ea'
    return (
        <Polygon
            positions={coordinates}
            bloomeoId={value.id}
            color={color}
            ref={ref}
            pane={'plotPane'}
            key={color}
            eventHandlers={{
                click: () => {
                    singleSelectItem(value.id)
                },
            }}
        >
            {showText && (
                <Tooltip
                    key={rerender}
                    permanent
                    direction="center"
                    className="no-bg-tooltip"
                >
                    {value.name ?? value.id}
                </Tooltip>
            )}
        </Polygon>
    )
}
