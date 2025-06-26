import { atom, getDefaultStore } from 'jotai'
import { IPlotItem, Rectangle } from './plot-store'
import { selectAtom } from 'jotai/utils'
import _ from 'lodash'
import { createPathAtom } from './path-store'
import { Feature } from 'geojson'
import { produce } from 'immer'
import { DATA } from './data'

export const store = getDefaultStore()

export type ItemType =
    | 'PLOT'
    | 'PATH'
    | 'FIELD'
    | 'STATION'
    | 'TRIAL'
    | 'SENSOR'
    | 'OTHER'
const SORT_TYPE = {
    PLOT: 1,
    PATH: 1,
    FIELD: 4,
    STATION: 5,
    TRIAL: 1,
    SENSOR: 2,
    OTHER: 0,
}
export interface IItem<T = any> {
    id: string
    type: ItemType
    data: T
    geo: Feature
    startDate?: number
    endDate?: number
    selected?: boolean
    hidden?: boolean
    parent?: string
    name?: string
    species?: string
}
export const timelineDate = atom<number>(new Date(2025, 0, 0).getTime())

export const managerAtom = atom<Record<string, IItem | undefined>>(
    DATA as any as Record<string, IItem | undefined>
)
export const idGenerator = atom<number>(
    Object.values(store.get(managerAtom))
        .map((elt) => Number(elt?.id))
        .filter((elt) => !isNaN(elt))
        .reduce((max, current) => Math.max(max, current), 0)
)
export function getUniqueId() {
    store.set(idGenerator, (old) => old + 1)
    return store.get(idGenerator).toString()
}

export const selectZoneAtom = atom<Rectangle | undefined>(undefined)
export const selectedInspectorAtom = atom<string | null>(null)
const managerItemsTimelineAtom = atom<Record<string, IItem | undefined>>(
    (get) => {
        const items = get(managerAtom)
        const date = get(timelineDate)
        return Object.fromEntries(
            Object.entries(items).filter(([_, item]) => {
                return (
                    item &&
                    (!item.startDate || item.startDate <= date) &&
                    (!item.endDate || item.endDate >= date)
                )
            })
        )
    }
)
export const itemsAtom = selectAtom(managerItemsTimelineAtom, (items) => {
    return Object.values(items)
        .filter((elt): elt is IItem => elt !== undefined)
        .map((item) => ({
            id: item.id,
            type: item.type,
            hidden: item.hidden,
            selected: item.selected,
        }))
})

export const itemsFilteredAtom = atom((get) => {
    const items = get(managerItemsTimelineAtom)
    const search = get(searchAtom).toLowerCase()
    return Object.values(items)
        .filter((item) => {
            if (!item) return false
            if (search === '') return true
            const itemName =
                `${item.type} - ${item.data.name ?? item.id}`.toLowerCase()
            return itemName.includes(search)
        })
        .map((item) => ({
            id: item!.id,
            type: item!.type,
            hidden: item!.hidden,
            selected: item!.selected,
        }))
    const itemName = `{item.type} - {item.data.name ?? item.id}`
})
export const Editable = (id: string) =>
    selectAtom(managerAtom, (items) => {
        return items[id]
    })

export const pathIdsAtom = selectAtom(
    itemsAtom,
    (items) => {
        return items
            .filter((elt) => elt.type === 'PATH')
            .sort((a, b) => SORT_TYPE[a.type] - SORT_TYPE[b.type])
            .map((item) => item.id)
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
export function singleSelectItem(id: string) {
    store.set(
        managerAtom,
        produce((items) => {
            Object.values(items).forEach((item) => {
                if (!item) return
                if (item.id === id) {
                    item.selected = true
                } else {
                    item.selected = false
                }
            })
        })
    )
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

export const itemAtom = (itemId: string) =>
    selectAtom(managerAtom, (items) => {
        return items[itemId] as IItem | undefined
    })

export const itemEditAtom = (itemId: string) =>
    atom(
        (get) => get(managerAtom)[itemId] as IItem, // Lecture de la valeur de la clé
        (get, set, newValue: IItem) => {
            set(
                managerAtom,
                produce((items) => {
                    if (items[itemId]) {
                        items[itemId] = newValue
                    }
                })
            )
        }
    )

export const itemFieldEditAtom = (itemId: string, field: keyof IItem) =>
    atom(
        (get) => (get(itemEditAtom(itemId) as any) as IItem)[field], // Lecture de la valeur de la clé
        (get, set, newValue: any) => {
            set(itemEditAtom(itemId), {
                ...store.get(itemEditAtom(itemId)),
                [field]: newValue,
            } as IItem)
        }
    )

export const searchAtom = atom<string>('')
