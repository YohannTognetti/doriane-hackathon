import { atom } from 'jotai'
import { store } from './global-store'

export const gridNbRowAtom = atom('3')
export const gridNbColAtom = atom('3')
export const gridGapXAtom = atom('0')
export const gridGapYAtom = atom('0')

export const previewStartAtom = atom(false)
export const spaceHorizontalAtom = atom('1')
export const spaceVerticalAtom = atom('1')
export const widthAtom = atom('3')
export const heightAtom = atom('3')
export const angleAtom = atom('0')
export const offsetXAtom = atom('0')
export const offsetYAtom = atom('0')
export const getAllGridOptions = () => {
    return {
        nbRow: Number(store.get(gridNbRowAtom)) || 1,
        nbCol: Number(store.get(gridNbColAtom)) || 1,
        gapX: Number(store.get(gridGapXAtom)) || 0,
        gapY: Number(store.get(gridGapYAtom)) || 0,
    }
}
