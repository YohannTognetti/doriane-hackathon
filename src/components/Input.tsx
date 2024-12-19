import { TextField, TextFieldProps } from '@mui/material'
import { WritableAtom } from 'jotai'
import { Atom, PrimitiveAtom, useAtom } from 'jotai'

export default function DataInput(props: {
    label?: string
    atom: PrimitiveAtom<string>
    customSetter?: (newValue: string) => void
    type?: TextFieldProps['type']
}) {
    const [value, setValue] = useAtom(props.atom)
    return (
        <TextField
            label={props.label}
            variant="outlined"
            size="small"
            value={value ?? null}
            onChange={(event) => {
                setValue?.(event.target.value)
            }}
            type={props.type}
        />
    )
}
