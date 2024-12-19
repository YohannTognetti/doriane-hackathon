import { atom } from 'jotai'
import { store } from './global-store'

export const gridNbRowAtom = atom('3')
export const gridNbColAtom = atom('3')
export const gridGapXAtom = atom('5')
export const gridGapYAtom = atom('5')

export const getAllGridOptions = () => {
    return {
        nbRow: Number(store.get(gridNbRowAtom)) || 1,
        nbCol: Number(store.get(gridNbColAtom)) || 1,
        gapX: Number(store.get(gridGapXAtom)) || 0,
        gapY: Number(store.get(gridGapYAtom)) || 0,
    }
}
