import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'
import { IItem, itemAtom, singleSelectItem } from '../../../store/global-store'

export default function Sensor(props: { id: string }) {
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

    return (
        <Polygon
            positions={coordinates}
            bloomeoId={value.id}
            color="#55ccFF"
            eventHandlers={{
                click: () => {
                    singleSelectItem(value.id)
                },
            }}
        >
            <Tooltip permanent direction="center" className="no-bg-tooltip">
                {/* Ton texte ici */}
                {value.id}
            </Tooltip>
        </Polygon>
    )
}
