import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAtom, useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useEffect, useMemo, useRef } from 'react'
import {
    IItem,
    itemFieldEditAtom,
    managerAtom,
    removeItem,
    selectedInspectorAtom,
    store,
} from '../store/global-store'
import {
    angleAtom,
    heightAtom,
    offsetXAtom,
    offsetYAtom,
    previewStartAtom,
    spaceHorizontalAtom,
    spaceVerticalAtom,
    widthAtom,
} from '../store/grid-store'
import { DataHelper } from '../store/helper'
import { PathItem } from '../store/path-store'
import { plotField, PlotInfo } from '../store/plot-store'
import DataInput, { DataDate, DataInputSlider } from './Input'
import { GridTool } from './LeftMenu'
import booleanIntersects from '@turf/boolean-intersects'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'

export default function Inspector() {
    const [currentItem, setCurrentItem] = useAtom(selectedInspectorAtom)
    const selectedItems = useAtomValue(
        useMemo(
            () =>
                selectAtom(managerAtom, (items) =>
                    Object.values(items)
                        .filter((item): item is IItem => item !== undefined)
                        .filter((elt) => elt.selected)
                ),
            []
        )
    )

    const itemFound = selectedItems.find((plot) => plot.id === currentItem)
    const item = itemFound ?? selectedItems?.[0]
    useEffect(() => {
        if (!item) {
            setCurrentItem(null)
        } else if (itemFound === undefined) {
            setCurrentItem(item.id)
        }
    }, [selectedItems.length])
    // Liste des items en collision géographique avec l'item courant
    const allItems = useAtomValue(managerAtom)
    const collision: IItem[] = useMemo(() => {
        if (!item || !item.geo?.geometry) return []
        const currentGeom = item.geo.geometry
        return Object.values(allItems).filter(
            (other) =>
                other &&
                other.id !== item.id &&
                other.geo?.geometry &&
                // Collision Polygon/Polygon ou Point/Polygon ou Polygon/Point
                ((currentGeom.type === 'Polygon' &&
                    other.geo.geometry.type === 'Polygon' &&
                    booleanIntersects(currentGeom, other.geo.geometry)) ||
                    (currentGeom.type === 'Polygon' &&
                        other.geo.geometry.type === 'Point' &&
                        booleanPointInPolygon(
                            other.geo.geometry,
                            currentGeom
                        )) ||
                    (currentGeom.type === 'Point' &&
                        other.geo.geometry.type === 'Polygon' &&
                        booleanPointInPolygon(currentGeom, other.geo.geometry)))
        ) as IItem[]
    }, [item, allItems])
    const asPlotCollision =
        collision.filter((elt) => elt.type === 'PLOT').length === 0
    return (
        <Box
            width="100%"
            height={'100%'}
            display={'flex'}
            flexDirection={'column'}
            paddingX={'8px'}
            padding={'8px'}
            gap={'16px'}
            overflow={'auto'}
            key={item.id}
        >
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Items</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={currentItem ?? ''}
                    label="Items"
                    onChange={(event) => setCurrentItem(event.target.value)}
                >
                    {selectedItems.map((elt) => (
                        <MenuItem
                            key={elt.id}
                            value={elt.id}
                        >{`${elt.type} - ${elt.id} ${elt.data.name ?? ''}`}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <BasicInspector item={item} colision={collision} />
            {item && item.type === 'PLOT' && <PlotInspector plot={item.data} />}
            {item && item.type === 'FIELD' && asPlotCollision && (
                <FieldInspector item={item} />
            )}

            {item && item.type === 'PATH' && <PathInspector path={item} />}
            {item && item.type === 'TRIAL' && <TrialInspector item={item} />}
            <Button
                onClick={() => removeItem(item.id)}
                color="warning"
                variant="contained"
            >
                Remove item
            </Button>
        </Box>
    )
}

function PlotInspector({ plot }: { plot: PlotInfo }) {
    return (
        <Box width="100%" display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Box>id : {plot.id}</Box>
            <DataInput label="name" atom={plotField(plot.id, 'name')} />
            <DataInput label="location" atom={plotField(plot.id, 'location')} />
            <DataInput label="genotype" atom={plotField(plot.id, 'genotype')} />
            <DataInput
                label="replication"
                atom={plotField(plot.id, 'replication')}
            />
        </Box>
    )
}

function TrialInspector({ item }: { item: IItem }) {
    return (
        <Box width="100%" display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Box>Trial : {item.id}</Box>
            <DataInput label="name" atom={itemFieldEditAtom(item.id, 'name')} />
        </Box>
    )
}

function BasicInspector({
    item,
    colision,
}: {
    item: IItem
    colision: IItem[]
}) {
    return (
        <Box display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Box>
                {item.type} : {item.id}
            </Box>
            <DataInput label="name" atom={itemFieldEditAtom(item.id, 'name')} />
            <DataDate
                label="start date"
                atom={itemFieldEditAtom(item.id, 'startDate')}
            />
            <DataDate
                label="end date"
                atom={itemFieldEditAtom(item.id, 'endDate')}
            />
            {colision.length > 0 && (
                <>
                    <div> Attached to</div>
                    <Box
                        sx={{
                            maxHeight: '200px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {colision.map((elt) => (
                            <div>
                                {elt.type} - {elt.name ?? elt.id}
                            </div>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    )
}
function FieldInspector({ item }: { item: IItem<any> }) {
    const previewRef = useRef<any>([])
    const previewStart = useAtomValue(previewStartAtom)
    usePreviewManager(item.id)
    return (
        <Box width="100%" display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Box>id : {item.id}</Box>
            <DataInput label="spaceHorizontal" atom={spaceHorizontalAtom} />
            <DataInput label="spaceVertical" atom={spaceVerticalAtom} />
            <DataInput label="widthAtom" atom={widthAtom} />
            <DataInput label="heightAtom" atom={heightAtom} />
            <DataInputSlider
                label="angle"
                atom={angleAtom}
                min={0}
                max={90}
                step={0.2}
            />
            <DataInputSlider
                label="offsetX"
                atom={offsetXAtom}
                min={-20}
                max={20}
                step={0.1}
            />
            <DataInputSlider
                label="offsetY"
                atom={offsetYAtom}
                min={-20}
                max={20}
            />

            <Button
                onClick={() => store.set(previewStartAtom, (prev) => !prev)}
            >
                {previewStart ? 'Stop preview' : 'Start preview'}
            </Button>
            <Button
                onClick={() => {
                    store.set(previewStartAtom, false)
                    DataHelper.computeFieldPlot(item.id)
                    DataHelper.removePreviewPolygons()
                }}
            >
                generate plots
            </Button>
        </Box>
    )
}

export function usePreviewManager(id: string) {
    const previewStart = useAtomValue(previewStartAtom)
    const spaceHorizontal = useAtomValue(spaceHorizontalAtom)
    const spaceVertical = useAtomValue(spaceVerticalAtom)
    const width = useAtomValue(widthAtom)
    const height = useAtomValue(heightAtom)
    const angle = useAtomValue(angleAtom)
    const offsetX = useAtomValue(offsetXAtom)
    const offsetY = useAtomValue(offsetYAtom)
    useEffect(() => {
        if (!previewStart) {
            DataHelper.removePreviewPolygons()
        } else {
            DataHelper.previewFieldPlot(id)
        }
    }, [
        previewStart,
        spaceHorizontal,
        spaceVertical,
        width,
        height,
        angle,
        offsetX,
        offsetY,
    ])
    return null
}

function PathInspector(props: { path: PathItem }) {
    const path = props.path.data
    const plots = path.plotsIntersection
    const parentRef = useRef<HTMLDivElement>(null)
    const virtualizer = useVirtualizer({
        count: plots?.length ?? 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 30,
        enabled: true,
    })
    return (
        <Box
            width="100%"
            display={'flex'}
            flexDirection={'column'}
            gap={'8px'}
            overflow={'hidden'}
        >
            <Box>Path :</Box>
            <Button
                onClick={() => removeItem(props.path.id)}
                color="error"
                variant="contained"
            >
                Delete path
            </Button>
            <Button
                // onClick={() => computePlotIntersection(props.path.id)}
                color="info"
                variant="contained"
            >
                Compute plots
            </Button>
            <div
                ref={parentRef}
                className="List"
                style={{
                    height: 400,
                    overflowY: 'auto',
                    contain: 'strict',
                }}
            >
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                        overflow: 'auto',
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                        const plotId = plots?.[virtualRow.index] || ''
                        return (
                            <Box
                                key={plotId}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                {virtualRow.index} : Plot - {plotId}
                            </Box>
                        )
                    })}
                </div>
            </div>
        </Box>
    )
}
