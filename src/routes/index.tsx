import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Stage, Layer, Star, Text } from 'react-konva'
import DataAllPlotRender from '../components/PlotRender'
import { useMemo, useRef, useState } from 'react'
import FieldRender from '../components/FieldRender'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    plotsAtom,
    addPlot,
    selectZoneAtom,
    store,
    modeSelectedAtom,
    addGrid,
    setAllPlotIntersectToSelect,
} from '../store/store'
import { selectAtom } from 'jotai/utils'
import Box from '@mui/material/Box'
import Toolbox from '../components/Toolbox'
import AutoSizer from 'react-virtualized-auto-sizer'
import { range } from '../utils/utils'
import { DataSelectZoneRender } from '../components/SelectZone'
import Inspector from '../components/Inspector'

export const Route = createFileRoute('/')({
    component: HomeComponent,
})

function HomeComponent() {
    const plots = useAtomValue(
        useMemo(() => selectAtom(plotsAtom, (plots) => plots.length), [])
    )
    const mode = useAtomValue(modeSelectedAtom)
    const setSelectedZone = useSetAtom(selectZoneAtom)

    return (
        <Box display={'flex'} flex={'1'}>
            <Toolbox />
            <Box flex={'1'} minWidth={0}>
                <AutoSizer>
                    {({ height, width }) => (
                        <Stage width={width} height={height}>
                            <Layer
                                id="mainLayer"
                                onMouseDown={(event) => {
                                    if (event.target.attrs.id !== 'field') {
                                        return
                                    }
                                    setSelectedZone({
                                        x: event.evt.layerX,
                                        y: event.evt.layerY,
                                        x2: event.evt.layerX,
                                        y2: event.evt.layerY,
                                    })
                                }}
                                onMouseMove={(event) => {
                                    if (
                                        store.get(selectZoneAtom) === undefined
                                    ) {
                                        return
                                    }
                                    setSelectedZone((old) => {
                                        if (!old) return undefined
                                        return {
                                            ...old,
                                            x2: event.evt.layerX,
                                            y2: event.evt.layerY,
                                        }
                                    })
                                }}
                                onMouseUp={(event) => {
                                    const selection = store.get(selectZoneAtom)
                                    if (selection === undefined) {
                                        return
                                    }
                                    if (mode === 'Add plot') {
                                        addPlot({
                                            x: selection.x,
                                            y: selection.y,
                                            x2: selection.x2,
                                            y2: selection.y2,
                                        })
                                    } else if (mode === 'Add grid') {
                                        addGrid({
                                            x: selection.x,
                                            y: selection.y,
                                            x2: selection.x2,
                                            y2: selection.y2,
                                            col: 3,
                                            gapX: 5,
                                            gapY: 5,
                                            row: 3,
                                        })
                                    } else if (mode === null) {
                                        setAllPlotIntersectToSelect({
                                            x: selection.x,
                                            y: selection.y,
                                            x2: selection.x2,
                                            y2: selection.y2,
                                        })
                                    }
                                    setSelectedZone(undefined)
                                }}
                            >
                                <FieldRender width={width} height={height} />
                                {range(plots).map((elt, index) => (
                                    <DataAllPlotRender
                                        plotIndex={index}
                                        key={index}
                                    />
                                ))}
                                <DataSelectZoneRender />
                            </Layer>
                        </Stage>
                    )}
                </AutoSizer>
            </Box>
            <Inspector />
        </Box>
    )
}
