import { Button, Input, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import { useAtom, useAtomValue } from 'jotai'
import { ETool, modeSelectedAtom, selectTool } from '../store/store'
import DataInput from './Input'
import {
    gridGapXAtom,
    gridGapYAtom,
    gridNbColAtom,
    gridNbRowAtom,
} from '../store/grid-store'
import { savePath } from '../store/path-store'

export default function Toolbox() {
    const modeSelected = useAtomValue(modeSelectedAtom)
    return (
        <Box
            width="200px"
            height={'100%'}
            display={'flex'}
            flexDirection={'column'}
        >
            {[
                { mode: ETool.ADD_PLOT, label: 'Add plot' },
                { mode: ETool.ADD_GRID, label: 'Add grid' },
                { mode: ETool.MAKE_PATH, label: 'Make path' },
            ].map((elt) => (
                <Button
                    onClick={() => {
                        selectTool(elt.mode)
                    }}
                    color={modeSelected === elt.mode ? 'secondary' : 'primary'}
                >
                    {elt.label}
                </Button>
            ))}
            <Box marginTop={'auto'}>
                Selected tool : {modeSelected}
                {modeSelected === ETool.ADD_GRID && <GridTool />}
                {modeSelected === ETool.MAKE_PATH && <PathTool />}
            </Box>
        </Box>
    )
}

function GridTool() {
    return (
        <>
            <DataInput atom={gridNbColAtom} label="nb Col" type="number" />
            <DataInput atom={gridNbRowAtom} label="nb Row" type="number" />
            <DataInput atom={gridGapXAtom} label="gap X" type="number" />
            <DataInput atom={gridGapYAtom} label="gap Y" type="number" />
        </>
    )
}

function PathTool() {
    return (
        <>
            <Button
                variant="contained"
                color="success"
                onClick={() => savePath()}
            >
                Save path
            </Button>
        </>
    )
}
