import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Marker, Polygon, Tooltip } from 'react-leaflet'
import { IItem, itemAtom } from '../../../store/global-store'

export default function Station(props: { id: string }) {
    const value = useAtomValue(
        useMemo(() => itemAtom(props.id), [props.id])
    ) as IItem<any>
    if (value.geo.geometry.type !== 'Point') {
        return null
    }

    return (
        <Marker
            bloomeoId={value.id}
            position={[
                value.geo.geometry.coordinates[1],
                value.geo.geometry.coordinates[0],
            ]}
            key={value.id}
        >
            <Tooltip
                permanent
                direction="center"
                className="no-bg-tooltip"
                offset={[0, -20]}
            >
                {value.name}
            </Tooltip>
        </Marker>
    )
}
