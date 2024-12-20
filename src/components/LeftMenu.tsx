import { Button, Checkbox, Input, TextField } from '@mui/material'
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
import {
    itemAtom,
    itemsAtom,
    managerAtom,
    selectItem,
    store,
} from '../store/global-store'
import { useMemo } from 'react'

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
                    key={elt.mode}
                    onClick={() => {
                        selectTool(elt.mode)
                    }}
                    color={modeSelected === elt.mode ? 'secondary' : 'primary'}
                >
                    {elt.label}
                </Button>
            ))}
            <Button
                onClick={() => {
                    store.set(managerAtom, {})
                }}
                color={'error'}
            >
                RESET
            </Button>
            <ItemsTool></ItemsTool>
            <Box>
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

function ItemsTool() {
    const items = useAtomValue(itemsAtom)
    return (
        <Box
            marginTop={'auto'}
            height={'200px'}
            overflow={'auto'}
            width={'100%'}
        >
            {items.map((elt) => (
                <ItemTool id={elt.id} key={elt.id} />
            ))}
        </Box>
    )
}

function ItemTool(props: { id: string }) {
    const item = useAtomValue(useMemo(() => itemAtom(props.id), [props.id]))
    console.log('item', item)
    if (!item) return
    return (
        <Box display={'flex'} alignItems={'center'}>
            <Checkbox
                checked={item.selected ?? false}
                onChange={() => selectItem(props.id)}
            />
            {item.type} - {item.id}
        </Box>
    )
}
