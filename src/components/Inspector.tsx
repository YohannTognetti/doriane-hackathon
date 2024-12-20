import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material'
import { useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import { useEffect, useMemo, useState } from 'react'
import { managerAtom } from '../store/global-store'
import { IPlotItem, plotField, PlotInfo, removePlotById } from '../store/store'
import DataInput from './Input'
import { computePlotIntersection, pathAtom } from '../store/path-store'

export default function Inspector() {
    const [displayPlot, setDisplayPlot] = useState<string | null>(null)
    const selectedPlot = useAtomValue(
        useMemo(
            () =>
                selectAtom(managerAtom, (items) =>
                    Object.values(items)
                        .filter(
                            (item): item is IPlotItem => item?.type === 'PLOT'
                        )
                        .filter((elt) => elt.selected)
                ),
            []
        )
    )
    useEffect(() => {
        if (
            selectedPlot.length >= 1 &&
            (displayPlot === null ||
                selectedPlot.findIndex((elt) => elt.id === displayPlot) === -1)
        ) {
            setDisplayPlot(selectedPlot[0].id)
        } else if (selectedPlot.length === 0) {
            setDisplayPlot(null)
        }
    }, [selectedPlot])
    const item = selectedPlot.find((plot) => plot.id === displayPlot)
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
                    value={displayPlot ?? ''}
                    label="Items"
                    onChange={(event) => setDisplayPlot(event.target.value)}
                >
                    {selectedPlot.map((elt) => (
                        <MenuItem
                            value={elt.id}
                        >{`${elt.id} - ${elt.data.name ?? '_'}`}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {item && item.type === 'PLOT' && <PlotInspector plot={item.data} />}
            <PathInspector />
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

function PathInspector() {
    const [plots, setPlots] = useState<string[]>()
    const path = useAtomValue(pathAtom)
    return (
        <Box width="100%" display={'flex'} flexDirection={'column'} gap={'8px'}>
            <Box>Path :</Box>
            <Button
                onClick={() => setPlots(computePlotIntersection())}
                color="info"
                variant="contained"
            >
                Compute plots
            </Button>
            {plots?.map((plotId, index) => (
                <Box key={plotId}>
                    {index} : Plot - {plotId}
                </Box>
            ))}
        </Box>
    )
}
