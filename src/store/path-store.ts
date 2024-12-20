import { atom } from 'jotai'
import { getUniqueId, IItem, managerAtom, store } from './global-store'
import { IPlotItem } from './store'
export interface IPolygon {
    id: string
    points: IPoint[]
}
export interface Intersection {
    polygonId: string
    segmentIndex: number // Index du segment du chemin
    edgeIndex: number // Index de l'arête du polygone
    distance: number // Distance au point de départ du segment
}
export interface IPath {
    points: IPoint[]
    plotsIntersection: string[]
}
export interface PathItem extends IItem<IPath> {}
export interface IPoint {
    x: number
    y: number
}

export const pathAtom = atom<IPath>({ points: [], plotsIntersection: [] })

export function addPoint(point: IPoint) {
    store.set(pathAtom, (oldPath) => ({
        ...oldPath,
        points: [...oldPath.points, point],
    }))
}
export function savePath() {
    const path = store.get(pathAtom)
    const id = getUniqueId()
    store.set(managerAtom, (old) => ({
        ...old,
        [id]: {
            id: id,
            data: path,
            type: 'PATH',
        } satisfies IItem<IPath>,
    }))
    store.set(pathAtom, { points: [], plotsIntersection: [] })
}

export function computePlotIntersection() {
    const path = store.get(pathAtom)
    const items = store.get(managerAtom)
    const plotItems = Object.values(items).filter(
        (elt): elt is IPlotItem => elt?.type === 'PLOT'
    )
    const plotItemsToPoints = plotItems.map(
        (item) =>
            ({
                ...item,
                points: [
                    { x: item.data.x, y: item.data.y },
                    { x: item.data.x + item.data.width, y: item.data.y },
                    {
                        x: item.data.x + item.data.width,
                        y: item.data.y + item.data.height,
                    },
                    { x: item.data.x, y: item.data.y + item.data.height },
                ] satisfies IPoint[],
            }) satisfies IPolygon
    )
    const plotIntersect = listIntersectedPolygonsWithOrder(
        path,
        plotItemsToPoints
    )
    console.log('plotIntersect', plotIntersect)
    return plotIntersect.map((elt) => elt.polygonId)
}

/**
 * Vérifie si deux segments se croisent.
 */
function doSegmentsIntersect(
    p1: IPoint,
    p2: IPoint,
    q1: IPoint,
    q2: IPoint
): boolean {
    function orientation(a: IPoint, b: IPoint, c: IPoint): number {
        const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
        if (val === 0) return 0 // Colinéaire
        return val > 0 ? 1 : 2 // 1 = horaire, 2 = antihoraire
    }

    const o1 = orientation(p1, p2, q1)
    const o2 = orientation(p1, p2, q2)
    const o3 = orientation(q1, q2, p1)
    const o4 = orientation(q1, q2, p2)

    // Vérifie les orientations pour une intersection générale
    if (o1 !== o2 && o3 !== o4) return true

    return false
}

/**
 * Calcule la distance entre deux points.
 */
function calculateDistance(p1: IPoint, p2: IPoint): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
}

/**
 * Trouve les intersections entre un chemin et un polygone.
 */
function findPathPolygonIntersections(
    path: IPath,
    polygon: IPolygon
): Intersection[] {
    const polygonPoints = polygon.points
    const polygonEdges = []
    const intersections: Intersection[] = []

    // Construire les arêtes du polygone
    for (let i = 0; i < polygonPoints.length; i++) {
        const nextIndex = (i + 1) % polygonPoints.length
        polygonEdges.push([polygonPoints[i], polygonPoints[nextIndex]])
    }

    for (let i = 0; i < path.points.length - 1; i++) {
        const pathSegment = [path.points[i], path.points[i + 1]]

        for (let j = 0; j < polygonEdges.length; j++) {
            const [p1, p2] = polygonEdges[j]
            if (doSegmentsIntersect(pathSegment[0], pathSegment[1], p1, p2)) {
                const distance = calculateDistance(pathSegment[0], p1) // Distance au début du segment
                intersections.push({
                    polygonId: polygon.id,
                    segmentIndex: i,
                    edgeIndex: j,
                    distance,
                })
            }
        }
    }

    // Retirer les duplications en conservant la première intersection pour chaque polygone
    const uniqueIntersections: Intersection[] = []
    const visitedPolygons = new Set<string>()

    for (const intersection of intersections) {
        if (!visitedPolygons.has(intersection.polygonId)) {
            uniqueIntersections.push(intersection)
            visitedPolygons.add(intersection.polygonId)
        }
    }

    return uniqueIntersections
}

/**
 * Liste les polygones intersectés par un chemin donné et retourne l'ordre des intersections.
 */
function listIntersectedPolygonsWithOrder(
    path: IPath,
    polygons: IPolygon[]
): Intersection[] {
    const allIntersections: Intersection[] = []

    for (const polygon of polygons) {
        const intersections = findPathPolygonIntersections(path, polygon)
        allIntersections.push(...intersections)
    }

    // Trier les intersections par ordre des segments du chemin, puis par distance au point de départ
    return allIntersections.sort((a, b) => {
        if (a.segmentIndex !== b.segmentIndex) {
            return a.segmentIndex - b.segmentIndex
        }
        return a.distance - b.distance
    })
}
