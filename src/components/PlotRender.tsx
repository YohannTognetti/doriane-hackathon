import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useMemo } from 'react'
import { Group, Rect, Text } from 'react-konva'
import {
    modeSelectedAtom,
    selectZoneAtom,
    PlotInfo,
    plotsAtom,
    removePlot,
    selectPlot,
} from '../store/store'

export function PlotRender(props: {
    plotValue: PlotInfo | undefined
    plotIndex: number
}) {
    const mode = useAtomValue(modeSelectedAtom)

    const plotValue = props.plotValue
    if (!plotValue) return null
    return (
        <Group
            x={plotValue.x}
            y={plotValue.y}
            onClick={() => {
                if (mode === 'Select plot' || mode === null)
                    selectPlot(props.plotIndex)
                if (mode === 'Remove plot') removePlot(props.plotIndex)
            }}
            width={plotValue.width}
            height={plotValue.height}
            draggable
        >
            <Rect
                width={plotValue.width}
                height={plotValue.height}
                fill={plotValue.isSelected ? '#0000FF20' : '#00FF0020'}
                stroke="black"
                onDragStart={() => {}}
            ></Rect>
            <Text
                text={plotValue.id}
                align="center"
                verticalAlign="middle"
                width={plotValue.width}
                height={plotValue.height}
                fontSize={20}
            />
        </Group>
    )
}
export default function DataAllPlotRender(props: { plotIndex: number }) {
    const value = useAtomValue(
        useMemo(
            () => selectAtom(plotsAtom, (plots) => plots[props.plotIndex]),
            [props.plotIndex]
        )
    )
    return <PlotRender plotValue={value} plotIndex={props.plotIndex} />
}
