import Box from '@mui/material/Box'
import { createFileRoute } from '@tanstack/react-router'
import { useAtomValue, useSetAtom } from 'jotai'
import { Layer, Rect, Stage } from 'react-konva'
import AutoSizer from 'react-virtualized-auto-sizer'
import Debug from '../components/Debug'
import FieldRender from '../components/FieldRender'
import Inspector from '../components/Inspector'
import CurrentPathRender from '../components/path/CurrentPathRender'
import { DataSelectZoneRender } from '../components/SelectZone'
import Toolbox from '../components/LeftMenu'
import { selectZoneAtom, store } from '../store/global-store'
import { getAllGridOptions } from '../store/grid-store'
import { addPoint } from '../store/path-store'
import {
    addGrid,
    addPlot,
    ETool,
    modeSelectedAtom,
    setAllPlotIntersectToSelect,
} from '../store/plot-store'
import LayerRenderer from '../components/LayerRenderer'

export const Route = createFileRoute('/')({
    component: HomeComponent,
})

function HomeComponent() {
    const mode = useAtomValue(modeSelectedAtom)
    const setSelectedZone = useSetAtom(selectZoneAtom)
    return (
        <Box display={'flex'} flex={'1'}>
            <Debug />
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
                                    //for negative selection
                                    const selectionCorrectOrder = {
                                        x: Math.min(selection.x, selection.x2),
                                        y: Math.min(selection.y, selection.y2),
                                        x2: Math.max(selection.x, selection.x2),
                                        y2: Math.max(selection.y, selection.y2),
                                    }

                                    if (mode === 'Add plot') {
                                        addPlot({
                                            x: selectionCorrectOrder.x,
                                            y: selectionCorrectOrder.y,
                                            x2: selectionCorrectOrder.x2,
                                            y2: selectionCorrectOrder.y2,
                                        })
                                    } else if (mode === 'Add grid') {
                                        const gridOptions = getAllGridOptions()
                                        addGrid({
                                            x: selectionCorrectOrder.x,
                                            y: selectionCorrectOrder.y,
                                            x2: selectionCorrectOrder.x2,
                                            y2: selectionCorrectOrder.y2,
                                            col: gridOptions.nbCol,
                                            gapX: gridOptions.gapX,
                                            gapY: gridOptions.gapY,
                                            row: gridOptions.nbRow,
                                        })
                                    } else if (mode === ETool.NONE) {
                                        setAllPlotIntersectToSelect({
                                            x: selectionCorrectOrder.x,
                                            y: selectionCorrectOrder.y,
                                            x2: selectionCorrectOrder.x2,
                                            y2: selectionCorrectOrder.y2,
                                        })
                                    }
                                    setSelectedZone(undefined)
                                }}
                            >
                                <FieldRender width={width} height={height} />
                                <LayerRenderer />
                                <DataSelectZoneRender />
                                <CurrentPathRender />
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
