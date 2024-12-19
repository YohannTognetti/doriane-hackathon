import { atom, getDefaultStore } from 'jotai'

export const store = getDefaultStore()

export interface IItem<T = any> {
    id: string
    type: 'PLOT' | 'PATH'
    data: T
}
export const managerAtom = atom<Record<string, IItem | undefined>>({})
export const idGenerator = atom<number>(1)
export function getUniqueId() {
    store.set(idGenerator, (old) => old + 1)
    return store.get(idGenerator).toString()
}
