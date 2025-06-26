import { Slider, TextField, TextFieldProps } from '@mui/material'
import { WritableAtom } from 'jotai'
import { Atom, PrimitiveAtom, useAtom } from 'jotai'

export default function DataInput(props: {
    label?: string
    atom: PrimitiveAtom<string>
    customSetter?: (newValue: string) => void
    type?: TextFieldProps['type']
    sx?: TextFieldProps['sx']
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
            sx={props.sx}
        />
    )
}

export function DataInputSlider(props: {
    label?: string
    atom: PrimitiveAtom<string>
    min: number
    max: number
    step?: number
    customSetter?: (newValue: string) => void
    type?: TextFieldProps['type']
}) {
    const [value, setValue] = useAtom(props.atom)
    return (
        <Slider
            aria-label={props.label}
            min={props.min}
            max={props.max}
            step={props.step ?? 1}
            defaultValue={new Date(2025, 1, 1).getTime()}
            value={Number(value) ?? 0}
            valueLabelDisplay="auto"
            onChange={(e, value) => setValue(value.toString())}
            sx={{}}
        />
    )
}
