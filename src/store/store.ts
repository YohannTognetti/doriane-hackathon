import { atom, getDefaultStore } from 'jotai'
import { current, produce } from 'immer'
import { PrimitiveAtom } from 'jotai'
export const store = getDefaultStore()
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
    isSelected?: boolean
    id: string
    name?: string
}
export const idGenerator = atom<number>(1)
export function getUniqueId() {
    store.set(idGenerator, (old) => old + 1)
    return store.get(idGenerator).toString()
}

export const plotsAtom = atom<PlotInfo[]>([])
export const isDrag = atom<boolean>()

export const selectZoneAtom = atom<Rectangle | undefined>(undefined)

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
    store.set(plotsAtom, (plots): PlotInfo[] => {
        return [
            ...plots,
            { x: x, y: y, width: x2 - x, height: y2 - y, id: id.toString() },
        ]
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
export const selectPlot = (plotIndex: number) => {
    store.set(
        plotsAtom,
        produce((plots) => {
            const select = !plots[plotIndex].isSelected
            if (select) {
                plots.forEach((plot) => {
                    if (plot.isSelected) {
                        plot.isSelected = false
                    }
                })
                plots[plotIndex].isSelected = true
            } else {
                plots[plotIndex].isSelected = false
            }
        })
    )
}

export const removePlotById = (plotId: string) => {
    store.set(plotsAtom, (plots) => {
        const newPlots = plots.filter((plot) => plot.id !== plotId)
        return newPlots
    })
}
export const setAllPlotIntersectToSelect = (selection: Rectangle) => {
    store.set(
        plotsAtom,
        produce((plots) => {
            plots.forEach((plot) => {
                if (plot.isSelected) {
                    plot.isSelected = false
                }
                if (
                    isIntersect(selection, {
                        x: plot.x,
                        y: plot.y,
                        x2: plot.x + plot.width,
                        y2: plot.y + plot.height,
                    })
                ) {
                    plot.isSelected = true
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
        (get) => get(plotsAtom).find((elt) => elt.id === plotId)!, // Lecture de la valeur de la clé
        (get, set, newValue: PlotInfo) => {
            const currentObject = get(plotsAtom)
            set(
                plotsAtom,
                produce((plots) => {
                    const plotIndex = plots.findIndex(
                        (elt) => elt.id === plotId
                    )
                    plots[plotIndex] = newValue
                })
            )
        }
    )
export const plotField = (plotId: string, plotField: 'name') =>
    atom(
        (get) => get(plotAtom(plotId))[plotField] ?? '',
        (get, set, newValue: string) => {
            const atom = plotAtom(plotId)
            const currentObject = get(atom)
            if (!currentObject) return
            set(atom, { ...currentObject, [plotField]: newValue })
        }
    ) as PrimitiveAtom<string>
