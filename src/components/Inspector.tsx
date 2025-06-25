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
import { useEffect, useMemo, useRef, useState } from 'react'
import {
    IItem,
    managerAtom,
    removeItem,
    selectedInspectorAtom,
} from '../store/global-store'
import { PathItem } from '../store/path-store'
import { plotField, PlotInfo } from '../store/plot-store'
import DataInput from './Input'
import { GridTool } from './LeftMenu'

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
    return (
        <Box
            width="100%"
            height={'100%'}
            display={'flex'}
            flexDirection={'column'}
            paddingX={'8px'}
            gap={'16px'}
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
                            value={elt.id}
                        >{`${elt.type} - ${elt.id} ${elt.data.name ?? ''}`}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {item && item.type === 'PLOT' && <PlotInspector plot={item.data} />}
            {item && item.type === 'PATH' && <PathInspector path={item} />}
            <Button
                onClick={() => removeItem(item.id)}
                color="warning"
                variant="contained"
            >
                Remove item
            </Button>
            <GridTool />
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
