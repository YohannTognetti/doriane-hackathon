import { atom } from 'jotai'
import { getUniqueId, IItem, managerAtom, store } from './global-store'

export interface Path extends IItem<{ path: [] }> {}
export interface IPoint {
    x: number
    y: number
}

export const pathAtom = atom<IPoint[]>([])

export function addPoint(point: IPoint) {
    store.set(pathAtom, (oldPath) => [...oldPath, point])
}
export function savePath() {
    const path = store.get(pathAtom)
    const id = getUniqueId()
    store.set(managerAtom, (old) => ({
        ...old,
        [id]: { id: id, data: { path }, type: 'PATH' },
    }))
    store.set(pathAtom, [])
}
