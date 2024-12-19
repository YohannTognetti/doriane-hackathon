import { Box, Button } from '@mui/material'
import React, { useMemo } from 'react'
import { plotsAtom, selectTool } from '../store/store'
import { useAtom, useAtomValue } from 'jotai'
import { selectAtom } from 'jotai/utils'

export default function Inspector() {
    const selectedPlot = useAtomValue(
        useMemo(
            () =>
                selectAtom(plotsAtom, (plots) =>
                    plots.filter((elt) => elt.isSelected)
                ),
            []
        )
    )
    const first = selectedPlot[0]
    if (first) {
        return (
            <Box width="200px" height={'100%'}>
                <Box>Plot</Box>
                <Box>id : {first?.id}</Box>
                <Box>name : {first?.name}</Box>
            </Box>
        )
    } else {
        return <Box width="200px" height={'100%'}></Box>
    }
}
