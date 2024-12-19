import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Stage, Layer, Star, Text, Rect } from 'react-konva'
import DataAllPlotRender from '../components/PlotRender'
import { useMemo, useRef, useState } from 'react'
import FieldRender from '../components/FieldRender'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
    addPlot,
    selectZoneAtom,
    modeSelectedAtom,
    addGrid,
    setAllPlotIntersectToSelect,
    ETool,
    IPlot,
} from '../store/store'
import { selectAtom } from 'jotai/utils'
import Box from '@mui/material/Box'
import Toolbox from '../components/Toolbox'
import AutoSizer from 'react-virtualized-auto-sizer'
import { range } from '../utils/utils'
import { DataSelectZoneRender } from '../components/SelectZone'
import Inspector from '../components/Inspector'
import { getAllGridOptions } from '../store/grid-store'
import PathRender from '../components/PathRender'
import { addPoint } from '../store/path-store'
import { managerAtom, store } from '../store/global-store'

export const Route = createFileRoute('/')({
    component: HomeComponent,
})

function HomeComponent() {
    const plotIds = useAtomValue(
        useMemo(
            () =>
                selectAtom(
                    managerAtom,
                    (items) =>
                        Object.values(items)
                            .filter(
                                (item): item is IPlot => item?.type === 'PLOT'
                            )
                            .map((elt) => elt.id),
                    (a, b) => JSON.stringify(a) === JSON.stringify(b)
                ),
            []
        )
    )
    const mode = useAtomValue(modeSelectedAtom)
    const setSelectedZone = useSetAtom(selectZoneAtom)
    console.log(plotIds)
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
                                    if (
                                        ![
                                            ETool.ADD_GRID,
                                            ETool.ADD_PLOT,
                                            ETool.NONE,
                                        ].includes(mode)
                                    ) {
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
                                        const gridOptions = getAllGridOptions()
                                        addGrid({
                                            x: selection.x,
                                            y: selection.y,
                                            x2: selection.x2,
                                            y2: selection.y2,
                                            col: gridOptions.nbCol,
                                            gapX: gridOptions.gapX,
                                            gapY: gridOptions.gapY,
                                            row: gridOptions.nbRow,
                                        })
                                    } else if (mode === ETool.NONE) {
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
                                {plotIds.map((id, index) => (
                                    <DataAllPlotRender plotId={id} key={id} />
                                ))}
                                <DataSelectZoneRender />
                                <PathRender />
                            </Layer>
                            {mode === ETool.MAKE_PATH && (
                                <Layer>
                                    <Rect
                                        width={width}
                                        height={height}
                                        fill="transparent" // Vous pouvez aussi ajouter une couleur avec opacité.
                                        onClick={(evt) => {
                                            addPoint({
                                                x: evt.evt.layerX,
                                                y: evt.evt.layerY,
                                            })
                                        }}
                                        listening={true} // Par défaut, activé pour capturer les événements.
                                    />
                                </Layer>
                            )}
                        </Stage>
                    )}
                </AutoSizer>
            </Box>
            <Inspector />
        </Box>
    )
}
