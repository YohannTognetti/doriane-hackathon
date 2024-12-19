import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import {
    plotAtom,
    plotField,
    PlotInfo,
    plotsAtom,
    removePlotById,
    selectTool,
} from '../store/store'
import { useAtom, useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'
import DataInput from './Input'
import { focusAtom } from 'jotai-optics'

export default function Inspector() {
    const [displayPlot, setDisplayPlot] = useState<string | null>(null)
    const selectedPlot = useAtomValue(
        useMemo(
            () =>
                selectAtom(plotsAtom, (plots) =>
                    plots.filter((elt) => elt.isSelected)
                ),
            []
        )
    )
    useEffect(() => {
        if (selectedPlot.length >= 1) {
            setDisplayPlot(selectedPlot[0].id)
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
                <InputLabel id="demo-simple-select-label">Age</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={displayPlot}
                    label="Plot"
                    onChange={(event) => setDisplayPlot(event.target.value)}
                >
                    {selectedPlot.map((elt) => (
                        <MenuItem
                            value={elt.id}
                        >{`${elt.id} - ${elt.name ?? '_'}`}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {item && <PlotInspector plot={item} />}
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
