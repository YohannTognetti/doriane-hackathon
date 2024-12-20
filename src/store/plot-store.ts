import { atom, getDefaultStore } from 'jotai'
import { current, produce } from 'immer'
import { PrimitiveAtom } from 'jotai'
import { getUniqueId, store, IItem, managerAtom } from './global-store'
export interface Rectangle {
    x: number
    y: number
    x2: number
    y2: number
}

export interface PlotInfo {
    x: number
    y: number
    width: number
    height: number
    id: string
    name?: string
}
export interface IPlotItem extends IItem<PlotInfo> {}

export const isDrag = atom<boolean>()

export const addPlot = ({
    x,
    y,
    x2,
    y2,
}: {
    x: number
    y: number
    x2: number
    y2: number
}) => {
    if (Math.abs(x2 - x) < 2 || Math.abs(y2 - y) < 2) {
        return
    }
    const id = getUniqueId()
    store.set(managerAtom, (item) => {
        return {
            ...item,
            [id]: {
                id: id,
                data: {
                    x: x,
                    y: y,
                    width: x2 - x,
                    height: y2 - y,
                    id: id.toString(),
                },
                type: 'PLOT',
            },
        }
    })
}

export const addGrid = ({
    x,
    y,
    x2,
    y2,
    col,
    row,
    gapX,
    gapY,
}: {
    x: number
    y: number
    x2: number
    y2: number
    col: number
    row: number
    gapX: number
    gapY: number
}) => {
    const width = (x2 - x) / col - (col - 1) * gapX
    const height = (y2 - y) / row - (row - 1) * gapY
    for (let i = 0; i < col; i++) {
        for (let j = 0; j < row; j++) {
            const crtX = x + i * width + gapX * i
            const crtY = y + j * height + gapY * j
            addPlot({ x: crtX, y: crtY, x2: crtX + width, y2: crtY + height })
        }
    }
}
export const selectPlot = (id: string) => {
    store.set(
        managerAtom,
        produce((items) => {
            const item = items[id]
            if (!item || item.type !== 'PLOT') {
                return
            }
            item.selected = !item.selected
        })
    )
}

export const removePlotById = (plotId: string) => {
    store.set(managerAtom, (items) => {
        const newItems = { ...items }
        delete newItems[plotId]
        return newItems
    })
}
export const setAllPlotIntersectToSelect = (selection: Rectangle) => {
    store.set(
        managerAtom,
        produce((items) => {
            Object.values(items)
                .filter((item): item is IPlotItem => {
                    return item?.type === 'PLOT'
                })
                .forEach((item) => {
                    if (item.selected) {
                        item.selected = false
                    }
                    if (
                        isIntersect(selection, {
                            x: item.data.x,
                            y: item.data.y,
                            x2: item.data.x + item.data.width,
                            y2: item.data.y + item.data.height,
                        })
                    ) {
                        item.selected = true
                    }
                })
        })
    )
}
export function isIntersect(selection: Rectangle, item: Rectangle): boolean {
    const { x: sx, x2: sx2, y: sy, y2: sy2 } = selection
    const { x, x2, y, y2 } = item
    const noIntersection = sx2 < x || sx > x2 || sy2 < y || sy > y2
    return !noIntersection
}

export enum ETool {
    ADD_PLOT = 'Add plot',
    ADD_GRID = 'Add grid',
    MAKE_PATH = 'Make path',

    NONE = 'NONE',
}
export const modeSelectedAtom = atom<ETool>(ETool.NONE)

export const selectTool = (tool: ETool) => {
    store.set(modeSelectedAtom, (old) => (old === tool ? ETool.NONE : tool))
}

export const plotAtom = (plotId: string) =>
    atom(
        (get) => get(managerAtom)[plotId] as IPlotItem, // Lecture de la valeur de la clé
        (get, set, newValue: PlotInfo) => {
            const currentObject = get(managerAtom)
            set(
                managerAtom,
                produce((items) => {
                    if (items[plotId]) {
                        items[plotId].data = newValue
                    }
                })
            )
        }
    )
export const plotField = (plotId: string, plotField: 'name') =>
    atom(
        (get) => get(plotAtom(plotId))?.data[plotField] ?? '',
        (get, set, newValue: string) => {
            const atom = plotAtom(plotId)
            const currentObject = get(atom)
            if (!currentObject) return
            set(atom, { ...currentObject.data, [plotField]: newValue })
        }
    ) as PrimitiveAtom<string>
