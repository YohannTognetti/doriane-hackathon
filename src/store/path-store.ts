import { atom } from 'jotai'
import { getUniqueId, store } from './store'

export interface IPoint {
    x: number
    y: number
}
export const pathListAtom = atom<{ id: string; path: IPoint[] }[]>([])

export const pathAtom = atom<IPoint[]>([])

export function addPoint(point: IPoint) {
    store.set(pathAtom, (oldPath) => [...oldPath, point])
}
export function savePath() {
    const path = store.get(pathAtom)
    store.set(pathListAtom, (old) => [
        ...old,
        { id: getUniqueId(), path: path },
    ])
    store.set(pathAtom, [])
}
