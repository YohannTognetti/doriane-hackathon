import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IItem, managerAtom } from '../store/global-store'
import { computePlotIntersection, PathItem } from '../store/path-store'
import { plotField, PlotInfo, removePlotById } from '../store/plot-store'
import DataInput from './Input'

export default function Inspector() {
    const [currentItem, setCurrentItem] = useState<string | null>(null)
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
    useEffect(() => {
        if (
            selectedItems.length >= 1 &&
            (currentItem === null ||
                selectedItems.findIndex((elt) => elt.id === currentItem) === -1)
        ) {
            setCurrentItem(selectedItems[0].id)
        } else if (selectedItems.length === 0) {
            setCurrentItem(null)
        }
    }, [selectedItems])
    const item = selectedItems.find((plot) => plot.id === currentItem)
    return (
        <Box
            width="250px"
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
        </Box>
    )
}

function PlotInspector({ plot }: { plot: PlotInfo }) {
    return (
        <Box width="100%" display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Box>id : {plot.id}</Box>
            <DataInput label="name" atom={plotField(plot.id, 'name')} />
            <Button
                onClick={() => removePlotById(plot.id)}
                color="warning"
                variant="contained"
            >
                Remove plot
            </Button>
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
                onClick={() => computePlotIntersection(props.path.id)}
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
