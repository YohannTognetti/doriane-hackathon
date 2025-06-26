import { Slider } from '@mui/material'
import { Mark } from '@mui/material/Slider/useSlider.types'
import React from 'react'
import { store, timelineDate } from '../store/global-store'
import { useAtomValue } from 'jotai'

const toDateMarker = (year: number): Mark => {
    return {
        value: new Date(year, 0, 0).getTime(),
        label: year,
    }
}
const valueLabelFormat = (value: number) => {
    return new Date(value).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}
const marker = [
    toDateMarker(2023),
    toDateMarker(2024),
    toDateMarker(2025),
    { value: new Date().getTime(), label: 'Today' },
    toDateMarker(2026),
]
export default function Timeline() {
    const value = useAtomValue(timelineDate)
    return (
        <div
            style={{
                paddingTop: '50px',
                zIndex: 1000,
                position: 'absolute',
                bottom: 0,
                left: '20px',
                right: '20px',
                backgroundColor: '#ffffffD0',
                padding: '20px 30px 0px 30px',
                borderRadius: '40px',
            }}
        >
            <Slider
                aria-label="Date"
                min={marker[0].value}
                max={marker[marker.length - 1].value}
                defaultValue={new Date(2025, 1, 1).getTime()}
                value={value}
                getAriaValueText={valueLabelFormat}
                valueLabelFormat={valueLabelFormat}
                step={3600 * 1000 * 24}
                valueLabelDisplay="auto"
                marks={marker}
                onChange={(e, value) =>
                    store.set(timelineDate, value as number)
                }
                sx={{}}
            />
        </div>
    )
}
