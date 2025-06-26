import { useAtomValue } from 'jotai'
import { Polygon, Tooltip } from 'react-leaflet'
import { useMemo } from 'react'
import { itemAtom, IItem, singleSelectItem } from '../../../store/global-store'
import area from '@turf/area'

export default function Field(props: { id: string }) {
    const value = useAtomValue(
        useMemo(() => itemAtom(props.id), [props.id])
    ) as IItem<any>
    if (value.geo.geometry.type !== 'Polygon') {
        return null
    }
    const coordinates = useMemo(() => {
        const rawCoordinates = (value.geo.geometry as any)?.coordinates as any
        return rawCoordinates.map((ring: any) =>
            ring.map((point: any) => [point[1], point[0]])
        )
    }, [value.geo])
    const color = value.selected ? '#0099ea' : '#0077ea'
    const surface = useMemo(() => {
        return area({
            type: 'Feature',
            geometry: value.geo.geometry,
            properties: {},
        })
    }, [value.geo])

    return (
        <Polygon
            positions={coordinates}
            bloomeoId={value.id}
            color={color}
            pane={'fieldPane'}
            key={color}
            eventHandlers={{
                click: () => {
                    singleSelectItem(value.id)
                },
            }}
        >
            <Tooltip
                permanent
                direction="center"
                className="no-bg-tooltip"
                pane="textPane"
            >
                {value.name ?? value.id} - {surface.toFixed(2)} m²
            </Tooltip>
        </Polygon>
    )
}
