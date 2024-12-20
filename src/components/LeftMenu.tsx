import { Button, Checkbox, IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useAtomValue } from 'jotai'
import { useMemo, useRef } from 'react'
import {
    itemAtom,
    itemsAtom,
    managerAtom,
    selectItem,
    store,
    toggleHidden,
} from '../store/global-store'
import {
    gridGapXAtom,
    gridGapYAtom,
    gridNbColAtom,
    gridNbRowAtom,
} from '../store/grid-store'
import { savePath } from '../store/path-store'
import { ETool, modeSelectedAtom, selectTool } from '../store/plot-store'
import DataInput from './Input'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import VisibilityIcon from '@mui/icons-material/Visibility'

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
    const parentRef = useRef<HTMLDivElement>(null)
    const virtualizer = useVirtualizer({
        count: items?.length ?? 0,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 30,
        enabled: true,
    })
    return (
        <Box marginTop={'auto'} overflow={'hidden'} width={'100%'}>
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
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                        const item = items?.[virtualRow.index] || ''
                        return (
                            <Box
                                key={item.id}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualRow.size}px`,
                                    transform: `translateY(${virtualRow.start}px)`,
                                }}
                            >
                                <ItemTool id={item.id} />
                            </Box>
                        )
                    })}
                </div>
            </div>
        </Box>
    )
}

function ItemTool(props: { id: string }) {
    const item = useAtomValue(useMemo(() => itemAtom(props.id), [props.id]))
    if (!item) return
    return (
        <Box
            display={'flex'}
            alignItems={'center'}
            height={'100%'}
            width={'100%'}
        >
            <Checkbox
                checked={item.selected ?? false}
                onChange={() => selectItem(props.id)}
            />
            {item.type} - {item.id}
            <IconButton onClick={() => toggleHidden(props.id)}>
                {item.hidden ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
        </Box>
    )
}
