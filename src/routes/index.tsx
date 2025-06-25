import { Button } from '@mui/material'
import { createFileRoute } from '@tanstack/react-router'
import MapWrapper from '../components/map/MapWrapper'
import { drawnInProgressAtom, MapHelper } from '../store/map-store'
import { DataHelper } from '../store/helper'
import { managerAtom, store } from '../store/global-store'
import { useAtomValue } from 'jotai'
import Inspector from '../components/Inspector'
import { ItemsTool } from '../components/LeftMenu'

export const Route = createFileRoute('/')({
    component: HomeComponent,
})

function HomeComponent() {
    const isDrawing = useAtomValue(drawnInProgressAtom)
    console.log(store.get(managerAtom))
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr 200px',
                flex: 1,
                minHeight: 0,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
            >
                <Button
                    onClick={() => DataHelper.startDrawing('PLOT')}
                    disabled={isDrawing}
                >
                    Add plot
                </Button>
                <Button
                    onClick={() => DataHelper.startDrawing('TRIAL')}
                    disabled={isDrawing}
                >
                    Add Trial
                </Button>
                <Button
                    onClick={() => DataHelper.startDrawing('FIELD')}
                    disabled={isDrawing}
                >
                    Add field
                </Button>
                <Button
                    onClick={() => DataHelper.startDrawing('SENSOR')}
                    disabled={isDrawing}
                >
                    Add sensor
                </Button>
                <Button
                    onClick={() => DataHelper.startDrawing('TRIAL')}
                    disabled={isDrawing}
                >
                    Add trial
                </Button>
                <Button
                    onClick={() => DataHelper.startDrawing('STATION')}
                    disabled={isDrawing}
                >
                    Add Station
                </Button>
                <Button
                    onClick={() => DataHelper.drawingGrid()}
                    disabled={isDrawing}
                >
                    Plot grid
                </Button>
                <Button
                    onClick={DataHelper.stopDrawing}
                    disabled={!isDrawing}
                    color="error"
                >
                    Cancel
                </Button>
                <ItemsTool />
            </div>
            <MapWrapper />
            <Inspector />
        </div>
    )
}
