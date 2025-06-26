import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { Polygon, Tooltip } from 'react-leaflet'
import { IItem, itemAtom, singleSelectItem } from '../../../store/global-store'

export default function Trial(props: { id: string }) {
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
    const colors = value.selected ? '#FFF' : '#ccc'
    return (
        <Polygon
            positions={coordinates}
            bloomeoId={value.id}
            color={colors}
            pane={'trialPane'}
            eventHandlers={{
                click: () => {
                    singleSelectItem(value.id)
                },
            }}
            key={colors}
        ></Polygon>
    )
}
