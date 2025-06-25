import { useAtomValue } from 'jotai'
import { LayerGroup } from 'react-leaflet'
import { itemsAtom, ItemType } from '../../store/global-store'
import Plot from './items/Plot'
import Trial from './items/Trial'
import Station from './items/Station'
import Field from './items/GrowingArea'
import Sensor from './items/Sensor'

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
}
export default function BloomeoLayer() {
    const values = useAtomValue(itemsAtom)
    return (
        <LayerGroup>
            {Object.values(values).map((item) => {
                if (item.hidden) return null
                const Renderer = componentsMap[item.type] ?? null
                if (Renderer === null) return null
                return <Renderer id={item.id} key={item.id} />
            })}
        </LayerGroup>
    )
}
