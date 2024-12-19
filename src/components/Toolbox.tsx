import { Button } from '@mui/material'
import Box from '@mui/material/Box'
import { useAtom, useAtomValue } from 'jotai'
import { modeSelectedAtom, selectTool } from '../store/store'

export default function Toolbox() {
    const modeSelected = useAtomValue(modeSelectedAtom)
    return (
        <Box width="100px" height="100%">
            <Button
                onClick={() => {
                    selectTool('Add plot')
                }}
                color={modeSelected === 'Add plot' ? 'secondary' : 'primary'}
            >
                Add plot
            </Button>
            <Button
                onClick={() => {
                    selectTool('Remove plot')
                }}
                color={modeSelected === 'Remove plot' ? 'secondary' : 'primary'}
            >
                Remove plot
            </Button>
            <Button
                onClick={() => {
                    selectTool('Add grid')
                }}
                color={modeSelected === 'Add grid' ? 'secondary' : 'primary'}
            >
                Add grid
            </Button>
        </Box>
    )
}
