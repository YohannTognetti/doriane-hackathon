import { atom, getDefaultStore } from 'jotai'
import { IPlotItem, Rectangle } from './plot-store'
import { selectAtom } from 'jotai/utils'
import _ from 'lodash'
import { createPathAtom } from './path-store'
import { Feature } from 'geojson'

export const store = getDefaultStore()

export type ItemType =
    | 'PLOT'
    | 'PATH'
    | 'FIELD'
    | 'STATION'
    | 'TRIAL'
    | 'SENSOR'
export interface IItem<T = any> {
    id: string
    type: ItemType
    data: T
    geo: Feature
    selected?: boolean
    hidden?: boolean
}
export const managerAtom = atom<Record<string, IItem | undefined>>({
    '-1': {
        id: '-1',
        type: 'PLOT',
        data: {},
        geo: {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [-2.88743, 48.205951],
                        [-2.88434, 48.203061],
                        [-2.882366, 48.20349],
                        [-2.886143, 48.206695],
                        [-2.88743, 48.205951],
                    ],
                ],
            },
        },
    },
})
export const idGenerator = atom<number>(0)
export function getUniqueId() {
    store.set(idGenerator, (old) => old + 1)
    return store.get(idGenerator).toString()
}

export const selectZoneAtom = atom<Rectangle | undefined>(undefined)
export const selectedInspectorAtom = atom<string | null>(null)
export const itemsAtom = selectAtom(managerAtom, (items) => {
    return Object.values(items)
        .filter((elt): elt is IItem => elt !== undefined)
        .map((item) => ({
            id: item.id,
            type: item.type,
            hidden: item.hidden,
            selected: item.selected,
        }))
})
export const itemAtom = (id: string) =>
    selectAtom(managerAtom, (items) => {
        return items[id]
    })

export const pathIdsAtom = selectAtom(
    itemsAtom,
    (items) => {
        return items.filter((elt) => elt.type === 'PATH').map((item) => item.id)
    },
    (a, b) => _.isEqual(a, b)
)
export const plotIdsAtom = selectAtom(
    managerAtom,
    (items) =>
        Object.values(items)
            .filter((elt): elt is IItem<IPlotItem> => elt?.type === 'PLOT')
            .map((item) => item.id),
    (a, b) => _.isEqual(a, b)
)

export function selectItem(id: string) {
    store.set(managerAtom, (items) => {
        if (!items[id]) return items
        return {
            ...items,
            [id]: { ...items[id], selected: !items[id]!.selected },
        }
    })
    store.set(selectedInspectorAtom, id)
}
export function toggleHidden(id: string) {
    store.set(managerAtom, (items) => {
        if (!items[id]) return items
        return {
            ...items,
            [id]: { ...items[id], hidden: !items[id]!.hidden },
        }
    })
}

export function resetAll() {
    store.set(managerAtom, {})
    store.set(idGenerator, 0)
    store.set(createPathAtom, { plotsIntersection: [], points: [] })
}

export const removeItem = (id: string) => {
    store.set(managerAtom, (items) => {
        const newItems = { ...items }
        delete newItems[id]
        return newItems
    })
}
