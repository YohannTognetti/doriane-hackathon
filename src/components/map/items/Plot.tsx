import { IItem, itemAtom } from '../../../store/global-store'
import { useAtomValue } from 'jotai'
import { Polygon, Tooltip } from 'react-leaflet'
import { PlotInfo } from '../../../store/plot-store'
import { useMemo } from 'react'

export default function Plot(props: { id: string }) {
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

    return (
        <Polygon positions={coordinates} bloomeoId={value.id} color="red">
            {value.data.name && (
                <Tooltip permanent direction="center" className="no-bg-tooltip">
                    {/* Ton texte ici */}
                    {value.data.name}
                </Tooltip>
            )}
        </Polygon>
    )
}
