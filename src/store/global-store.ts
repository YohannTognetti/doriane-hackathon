import { atom, getDefaultStore } from 'jotai'
import { IPlotItem, Rectangle } from './store'
import { selectAtom } from 'jotai/utils'
import _ from 'lodash'

export const store = getDefaultStore()

export interface IItem<T = any> {
    id: string
    type: 'PLOT' | 'PATH'
    data: T
    selected?: boolean
}
export const managerAtom = atom<Record<string, IItem | undefined>>({})
export const idGenerator = atom<number>(0)
export function getUniqueId() {
    store.set(idGenerator, (old) => old + 1)
    return store.get(idGenerator).toString()
}

export const selectZoneAtom = atom<Rectangle | undefined>(undefined)

export const itemsAtom = selectAtom(managerAtom, (items) => {
    return Object.values(items)
        .filter((elt): elt is IItem => elt !== undefined)
        .map((item) => ({ id: item.id, type: item.type }))
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
}
