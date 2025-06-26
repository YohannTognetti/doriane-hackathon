import { useAtomValue } from 'jotai'
import { LayerGroup, Pane } from 'react-leaflet'
import {
    itemsAtom,
    ItemType,
    managerAtom,
    store,
} from '../../store/global-store'
import Field from './items/Field'
import Plot from './items/Plot'
import Sensor from './items/Sensor'
import Station from './items/Station'
import Trial from './items/Trial'

const componentsMap: Record<
    ItemType,
    ((props: { id: string }) => JSX.Element | null) | null
> = {
    PLOT: Plot,
    FIELD: Field,
    PATH: null,
    STATION: Station,
    TRIAL: Trial,
    SENSOR: Sensor,
    OTHER: null,
}
export default function BloomeoLayer() {
    const values = useAtomValue(itemsAtom)

    return (
        <LayerGroup>
            <Pane name="textPane" style={{ zIndex: 700 }} />
            <Pane name="plotPane" style={{ zIndex: 650 }} />
            <Pane name="trialPane" style={{ zIndex: 651 }} />
            <Pane name="fieldPane" style={{ zIndex: 652 }} />

            {Object.values(values).map((item) => {
                if (item.hidden) return null
                const Renderer = componentsMap[item.type] ?? null
                if (Renderer === null) return null
                return <Renderer id={item.id} key={'k' + item.id} />
            })}
        </LayerGroup>
    )
}
