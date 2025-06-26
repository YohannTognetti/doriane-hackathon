import L from 'leaflet'
import { Polygon, Position } from 'geojson'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import {
    getUniqueId,
    store,
    managerAtom,
    ItemType,
    IItem,
    timelineDate,
} from './global-store'
import { drawnInProgressAtom, getMapRef } from './map-store'
import {
    gridGapXAtom,
    gridNbColAtom,
    getAllGridOptions,
    spaceHorizontalAtom,
    spaceVerticalAtom,
    widthAtom,
    heightAtom,
    angleAtom,
    offsetXAtom,
    offsetYAtom,
} from './grid-store'

let preview: any[] = []
export abstract class DataHelper {
    static drawingGrid() {
        const mapRef = getMapRef()
        if (!mapRef) return
        mapRef.pm?.disableDraw()
        mapRef.off('pm:create')
        store.set(drawnInProgressAtom, true)

        let points: [number, number][] = []
        let tempRect: L.Polygon | null = null
        let tempLine: L.Polyline | null = null
        let tempGridPolygons: L.Polygon[] = []

        function clearTempGrid() {
            tempGridPolygons.forEach((p) => p.remove())
            tempGridPolygons = []
        }

        function onClick(e: any) {
            const { lat, lng } = e.latlng
            points.push([lat, lng])
            if (points.length === 1) {
                mapRef.on('mousemove', onMouseMove)
            } else if (points.length === 2) {
                if (tempLine) tempLine.remove()
                mapRef.on('mousemove', onMouseMove)
            } else if (points.length === 3) {
                mapRef.off('mousemove', onMouseMove)
                mapRef.off('click', onClick)
                if (tempRect) tempRect.remove()
                clearTempGrid()
                // Compute the final oriented rectangle
                const rectCoords = DataHelper.computeOrientedRectangle(
                    points[0],
                    points[1],
                    points[2]
                )
                DataHelper.generatePlotFromGrid(rectCoords)
                store.set(drawnInProgressAtom, false)
            }
        }

        function onMouseMove(e: any) {
            if (points.length === 1) {
                // Draw a dynamic line from the first point to the mouse
                const { lat, lng } = e.latlng
                const lineCoords = [points[0], [lat, lng]]
                if (tempLine) tempLine.setLatLngs(lineCoords)
                else
                    tempLine = L.polyline(lineCoords, {
                        color: 'blue',
                        dashArray: '5,5',
                    }).addTo(mapRef)
                clearTempGrid()
            } else if (points.length === 2) {
                // Draw a dynamic rectangle and grid preview
                const { lat, lng } = e.latlng
                const rectCoords = DataHelper.computeOrientedRectangle(
                    points[0],
                    points[1],
                    [lat, lng]
                )
                if (tempRect) tempRect.setLatLngs(rectCoords)
                else
                    tempRect = L.polygon(rectCoords, {
                        color: 'red',
                        dashArray: '5,5',
                        fillOpacity: 0.1,
                    }).addTo(mapRef)
                // --- Grid preview ---
                clearTempGrid()
                DataHelper.previewGrid(rectCoords, mapRef, tempGridPolygons)
            }
        }

        mapRef.on('click', onClick)
    }

    /**
     * Preview a 3x3 grid inside an oriented rectangle (for drawingGrid mousemove)
     */
    static previewGrid(
        rectCoords: [number, number][],
        map: L.Map,
        tempGridPolygons: L.Polygon[]
    ) {
        const [p0, p1, , p3] = rectCoords.slice(0, 4)
        // Project rectangle corners
        const p0p = map.project(L.latLng(p0[0], p0[1]))
        const p1p = map.project(L.latLng(p1[0], p1[1]))
        const p3p = map.project(L.latLng(p3[0], p3[1]))
        // Base and height vectors (pixels)
        const baseVec = L.point(p1p.x - p0p.x, p1p.y - p0p.y)
        const heightVec = L.point(p3p.x - p0p.x, p3p.y - p0p.y)
        // Lengths in meters
        const baseLenMeters = map.distance(
            L.latLng(p0[0], p0[1]),
            L.latLng(p1[0], p1[1])
        )
        const heightLenMeters = map.distance(
            L.latLng(p0[0], p0[1]),
            L.latLng(p3[0], p3[1])
        )
        // Get grid options from store
        const { nbRow, nbCol, gapX, gapY } = getAllGridOptions()
        // Plot size
        const plotWidthMeters = (baseLenMeters - (nbCol + 1) * gapX) / nbCol
        const plotHeightMeters = (heightLenMeters - (nbRow + 1) * gapY) / nbRow
        // Normalize vectors
        const baseNorm = Math.sqrt(
            baseVec.x * baseVec.x + baseVec.y * baseVec.y
        )
        const heightNorm = Math.sqrt(
            heightVec.x * heightVec.x + heightVec.y * heightVec.y
        )
        const baseUnit = L.point(baseVec.x / baseNorm, baseVec.y / baseNorm)
        const heightUnit = L.point(
            heightVec.x / heightNorm,
            heightVec.y / heightNorm
        )
        // Meter to pixel conversion
        const metersToPxBase = baseNorm / baseLenMeters
        const metersToPxHeight = heightNorm / heightLenMeters
        for (let row = 0; row < nbRow; row++) {
            for (let col = 0; col < nbCol; col++) {
                const offsetBaseMeters = gapX + col * (plotWidthMeters + gapX)
                const offsetHeightMeters =
                    gapY + row * (plotHeightMeters + gapY)
                const offsetBasePx = offsetBaseMeters * metersToPxBase
                const offsetHeightPx = offsetHeightMeters * metersToPxHeight
                // Origin of the plot
                const origin = L.point(
                    p0p.x +
                        baseUnit.x * offsetBasePx +
                        heightUnit.x * offsetHeightPx,
                    p0p.y +
                        baseUnit.y * offsetBasePx +
                        heightUnit.y * offsetHeightPx
                )
                const pA = origin
                const pB = L.point(
                    origin.x + baseUnit.x * plotWidthMeters * metersToPxBase,
                    origin.y + baseUnit.y * plotWidthMeters * metersToPxBase
                )
                const pC = L.point(
                    pB.x + heightUnit.x * plotHeightMeters * metersToPxHeight,
                    pB.y + heightUnit.y * plotHeightMeters * metersToPxHeight
                )
                const pD = L.point(
                    origin.x +
                        heightUnit.x * plotHeightMeters * metersToPxHeight,
                    origin.y +
                        heightUnit.y * plotHeightMeters * metersToPxHeight
                )
                // Unproject to [lat, lng]
                const coords: [number, number][] = [
                    [map.unproject(pA).lat, map.unproject(pA).lng],
                    [map.unproject(pB).lat, map.unproject(pB).lng],
                    [map.unproject(pC).lat, map.unproject(pC).lng],
                    [map.unproject(pD).lat, map.unproject(pD).lng],
                    [map.unproject(pA).lat, map.unproject(pA).lng],
                ]
                const poly = L.polygon(coords, {
                    color: 'green',
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '2,2',
                }).addTo(map)
                tempGridPolygons.push(poly)
            }
        }
    }

    /**
     * Generate a 3x3 grid of plots inside an oriented rectangle, with a 1m gap between each plot (X and Y)
     * @param rectCoords [lat, lng][] - 5 points of the oriented rectangle (closed)
     */
    static generatePlotFromGrid(rectCoords: [number, number][]) {
        const map = getMapRef()
        const [p0, p1, , p3] = rectCoords.slice(0, 4)
        const p0p = map.project(L.latLng(p0[0], p0[1]))
        const p1p = map.project(L.latLng(p1[0], p1[1]))
        const p3p = map.project(L.latLng(p3[0], p3[1]))
        const baseVec = L.point(p1p.x - p0p.x, p1p.y - p0p.y)
        const heightVec = L.point(p3p.x - p0p.x, p3p.y - p0p.y)
        const baseLenMeters = map.distance(
            L.latLng(p0[0], p0[1]),
            L.latLng(p1[0], p1[1])
        )
        const heightLenMeters = map.distance(
            L.latLng(p0[0], p0[1]),
            L.latLng(p3[0], p3[1])
        )
        // Get grid options from store
        const { nbRow, nbCol, gapX, gapY } = getAllGridOptions()
        const plotWidthMeters = (baseLenMeters - (nbCol + 1) * gapX) / nbCol
        const plotHeightMeters = (heightLenMeters - (nbRow + 1) * gapY) / nbRow
        const baseNorm = Math.sqrt(
            baseVec.x * baseVec.x + baseVec.y * baseVec.y
        )
        const heightNorm = Math.sqrt(
            heightVec.x * heightVec.x + heightVec.y * heightVec.y
        )
        const baseUnit = L.point(baseVec.x / baseNorm, baseVec.y / baseNorm)
        const heightUnit = L.point(
            heightVec.x / heightNorm,
            heightVec.y / heightNorm
        )
        const metersToPxBase = baseNorm / baseLenMeters
        const metersToPxHeight = heightNorm / heightLenMeters
        for (let row = 0; row < nbRow; row++) {
            for (let col = 0; col < nbCol; col++) {
                const offsetBaseMeters = gapX + col * (plotWidthMeters + gapX)
                const offsetHeightMeters =
                    gapY + row * (plotHeightMeters + gapY)
                const offsetBasePx = offsetBaseMeters * metersToPxBase
                const offsetHeightPx = offsetHeightMeters * metersToPxHeight
                const origin = L.point(
                    p0p.x +
                        baseUnit.x * offsetBasePx +
                        heightUnit.x * offsetHeightPx,
                    p0p.y +
                        baseUnit.y * offsetBasePx +
                        heightUnit.y * offsetHeightPx
                )
                const pA = origin
                const pB = L.point(
                    origin.x + baseUnit.x * plotWidthMeters * metersToPxBase,
                    origin.y + baseUnit.y * plotWidthMeters * metersToPxBase
                )
                const pC = L.point(
                    pB.x + heightUnit.x * plotHeightMeters * metersToPxHeight,
                    pB.y + heightUnit.y * plotHeightMeters * metersToPxHeight
                )
                const pD = L.point(
                    origin.x +
                        heightUnit.x * plotHeightMeters * metersToPxHeight,
                    origin.y +
                        heightUnit.y * plotHeightMeters * metersToPxHeight
                )
                const coords: [number, number][] = [
                    [map.unproject(pA).lat, map.unproject(pA).lng],
                    [map.unproject(pB).lat, map.unproject(pB).lng],
                    [map.unproject(pC).lat, map.unproject(pC).lng],
                    [map.unproject(pD).lat, map.unproject(pD).lng],
                    [map.unproject(pA).lat, map.unproject(pA).lng],
                ]
                DataHelper.addItem('PLOT', {
                    type: 'Polygon',
                    coordinates: [coords.map(([lat, lng]) => [lng, lat])],
                })
            }
        }
    }

    static startDrawing(kind: ItemType) {
        const mapRef = getMapRef()
        if (mapRef.pm) {
            mapRef.pm.disableDraw()
            mapRef.off('pm:create')
            store.set(drawnInProgressAtom, true)

            mapRef.once('pm:create', (e) => {
                const layer = e.layer
                const geojson = (layer as L.Polygon).toGeoJSON()
                DataHelper.addItem(kind, geojson.geometry as any as Polygon)
                layer.remove()
                mapRef.pm.disableDraw()
                store.set(drawnInProgressAtom, false)
            })
            if (kind === 'STATION') {
                mapRef.pm.enableDraw('Marker', { finishOn: 'click' })
                return
            }
            mapRef.pm.enableDraw('Polygon', {
                snappable: true,
                templineStyle: { color: 'red', radius: 5 },
                hintlineStyle: { color: 'orange', dashArray: [5, 5] },
            })
        }
    }
    static addItem(kind: ItemType, polygon: Polygon, parent?: string) {
        const id = getUniqueId()

        store.set(managerAtom, (item) => {
            return {
                ...item,
                [id]: {
                    id: id,
                    startDate: store.get(timelineDate),
                    parent: parent,
                    data: {
                        id: id.toString(),
                    },
                    type: kind,
                    selected: true,
                    geo: {
                        type: 'Feature',
                        properties: {},
                        geometry: polygon,
                    },
                },
            }
        })
    }
    static addManyItem(kind: ItemType, polygons: Polygon[], parent?: string) {
        const itemsToAdd: [string, IItem][] = polygons.map((polygon) => {
            const id = getUniqueId().toString()
            const item: IItem = {
                id: id,
                data: {
                    id: id,
                },
                type: kind,
                selected: true,
                parent: parent,
                geo: {
                    type: 'Feature',
                    properties: {},
                    geometry: polygon,
                },
            }
            return [id, item]
        })
        store.set(managerAtom, (item) => {
            const newItems = { ...item }
            for (const [id, obj] of itemsToAdd) {
                newItems[id] = obj
            }
            return newItems
        })
        return itemsToAdd.map(([id]) => id)
    }

    static stopDrawing() {
        const mapRef = getMapRef()
        store.set(drawnInProgressAtom, false)
        if (mapRef.pm) {
            mapRef.pm.disableDraw()
            mapRef.off('pm:create')
        }
    }

    /**
     * Calcule les 4 coins d'un rectangle orienté à partir de 3 points (p1, p2 = base, p3 = largeur)
     * Retourne un tableau de 5 points [lat, lng] (rectangle fermé)
     */
    static computeOrientedRectangle(
        p1: [number, number],
        p2: [number, number],
        p3: [number, number]
    ): [number, number][] {
        const map = getMapRef()
        // 1. Conversion en points projetés
        const p1p = map.project(L.latLng(p1[0], p1[1]))
        const p2p = map.project(L.latLng(p2[0], p2[1]))
        const p3p = map.project(L.latLng(p3[0], p3[1]))

        // 2. Calcul rectangle en euclidien
        const dx = p2p.x - p1p.x
        const dy = p2p.y - p1p.y
        const norm = Math.sqrt(dx * dx + dy * dy)
        if (norm === 0) return [p1, p2, p2, p1, p1]
        const perp = { x: -dy / norm, y: dx / norm }
        const dx3 = p3p.x - p1p.x
        const dy3 = p3p.y - p1p.y
        const width = dx3 * perp.x + dy3 * perp.y
        const finalWidth = Math.abs(width)
        const sign = width >= 0 ? 1 : -1
        const perpSigned = { x: perp.x * sign, y: perp.y * sign }

        // 3. Calcul des coins en projeté
        const q0 = p1p
        const q1 = p2p
        const q2 = L.point(
            p2p.x + perpSigned.x * finalWidth,
            p2p.y + perpSigned.y * finalWidth
        )
        const q3 = L.point(
            p1p.x + perpSigned.x * finalWidth,
            p1p.y + perpSigned.y * finalWidth
        )

        // 4. Reprojection en [lat, lng]
        return [
            [map.unproject(q0).lat, map.unproject(q0).lng],
            [map.unproject(q1).lat, map.unproject(q1).lng],
            [map.unproject(q2).lat, map.unproject(q2).lng],
            [map.unproject(q3).lat, map.unproject(q3).lng],
            [map.unproject(q0).lat, map.unproject(q0).lng],
        ]
    }

    static computeFieldPlot(id: string) {
        const element = store.get(managerAtom)[id]
        if (
            !element ||
            element.type !== 'FIELD' ||
            element.geo.geometry.type !== 'Polygon'
        )
            return null

        // Paramètres du store (en mètres et degrés)
        const spaceH = Number(store.get(spaceHorizontalAtom))
        const spaceV = Number(store.get(spaceVerticalAtom))
        const plotWidth = Number(store.get(widthAtom))
        const plotHeight = Number(store.get(heightAtom))
        const angleDeg = Number(store.get(angleAtom))
        const offsetXValue = Number(store.get(offsetXAtom))
        const offsetYValue = Number(store.get(offsetYAtom))

        const map = getMapRef()
        const coords = element.geo.geometry.coordinates[0]
        const angleRad = (angleDeg * Math.PI) / 180

        // Utilise le centre du polygone comme référence pour la conversion mètres → pixels
        const bbox = L.latLngBounds(
            coords.map(([lng, lat]) => L.latLng(lat, lng))
        )
        const center = bbox.getCenter()
        // Conversion mètres → degrés adaptée à la latitude
        const metersPerDegreeLng =
            111320 * Math.cos((center.lat * Math.PI) / 180)
        const p0 = map.project(center)
        const pX = map.project(
            L.latLng(center.lat, center.lng + plotWidth / metersPerDegreeLng)
        )
        const pY = map.project(
            L.latLng(center.lat + plotHeight / 110540, center.lng)
        )
        const plotWidthPx = Math.abs(pX.x - p0.x)
        const plotHeightPx = Math.abs(pY.y - p0.y)

        // Calcul du bounding box aligné (pour la grille)
        const projected = coords.map(([lng, lat]) =>
            map.project(L.latLng(lat, lng))
        )
        const rotated = projected.map((pt) => ({
            x: pt.x * Math.cos(-angleRad) - pt.y * Math.sin(-angleRad),
            y: pt.x * Math.sin(-angleRad) + pt.y * Math.cos(-angleRad),
        }))
        const minX = Math.min(...rotated.map((p) => p.x))
        const maxX = Math.max(...rotated.map((p) => p.x))
        const minY = Math.min(...rotated.map((p) => p.y))
        const maxY = Math.max(...rotated.map((p) => p.y))

        // Conversion espace en pixels
        const spaceHPx = plotWidthPx * (spaceH / plotWidth)
        const spaceVPx = plotHeightPx * (spaceV / plotHeight)

        if (plotWidth <= 0 || plotHeight <= 0) return null

        const plots: Polygon[] = []
        let count = 0
        // Balayage complet de la grille (pas d'arrêt prématuré)
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                // Centre du plot dans le repère aligné (pixels)
                const gx =
                    minX +
                    offsetXValue +
                    i * (plotWidthPx + spaceHPx) +
                    plotWidthPx / 2
                const gy =
                    minY +
                    offsetYValue +
                    j * (plotHeightPx + spaceVPx) +
                    plotHeightPx / 2
                // Retour dans le repère carte
                const px = gx * Math.cos(angleRad) - gy * Math.sin(angleRad)
                const py = gx * Math.sin(angleRad) + gy * Math.cos(angleRad)
                const plotCenter = L.point(px, py)
                const plotCenterLatLng = map.unproject(plotCenter)

                // Coins du plot
                const halfW = plotWidthPx / 2
                const halfH = plotHeightPx / 2
                const corners = [
                    [-halfW, -halfH],
                    [halfW, -halfH],
                    [halfW, halfH],
                    [-halfW, halfH],
                    [-halfW, -halfH],
                ]
                const plotCoords = corners.map(([dx, dy]) => {
                    const cx = gx + dx
                    const cy = gy + dy
                    const fx = cx * Math.cos(angleRad) - cy * Math.sin(angleRad)
                    const fy = cx * Math.sin(angleRad) + cy * Math.cos(angleRad)
                    const ptPx = L.point(fx, fy)
                    const latlng = map.unproject(ptPx)
                    return [latlng.lng, latlng.lat]
                })

                // Test inclusion de tous les coins dans le polygone
                const turfPoly = {
                    type: 'Polygon',
                    coordinates: [
                        coords[0][0] !== coords[coords.length - 1][0] ||
                        coords[0][1] !== coords[coords.length - 1][1]
                            ? [...coords, coords[0]]
                            : coords,
                    ],
                } as Polygon
                const allCornersInside = plotCoords.every(([lng, lat]) =>
                    booleanPointInPolygon(
                        {
                            type: 'Point',
                            coordinates: [lng, lat],
                        } as import('geojson').Point,
                        turfPoly,
                        { ignoreBoundary: false }
                    )
                )
                if (allCornersInside) {
                    plots.push({
                        type: 'Polygon',
                        coordinates: [plotCoords],
                    } as Polygon)
                    count++
                    if (count >= 2500) break
                }
            }
            if (count >= 2500) break
        }
        DataHelper.addManyItem('PLOT', plots, id)
    }

    /**
     * Prévisualise la grille de plots sur la carte sans les ajouter au store.
     * Retourne la liste des objets L.Polygon créés.
     */
    static previewFieldPlot(id: string): L.Polygon[] {
        DataHelper.removePreviewPolygons()
        const map = getMapRef()
        const element = store.get(managerAtom)[id]
        if (
            !element ||
            element.type !== 'FIELD' ||
            element.geo.geometry.type !== 'Polygon'
        )
            return []

        const spaceH = Number(store.get(spaceHorizontalAtom))
        const spaceV = Number(store.get(spaceVerticalAtom))
        const plotWidth = Number(store.get(widthAtom))
        const plotHeight = Number(store.get(heightAtom))
        const angleDeg = Number(store.get(angleAtom))
        const offsetXValue = Number(store.get(offsetXAtom))
        const offsetYValue = Number(store.get(offsetYAtom))

        const coords = element.geo.geometry.coordinates[0]
        const angleRad = (angleDeg * Math.PI) / 180
        const bbox = L.latLngBounds(
            coords.map(([lng, lat]) => L.latLng(lat, lng))
        )
        const center = bbox.getCenter()
        const p0 = map.project(center)
        // Conversion mètres → degrés adaptée à la latitude
        const metersPerDegreeLng =
            111320 * Math.cos((center.lat * Math.PI) / 180)
        const pX = map.project(
            L.latLng(center.lat, center.lng + plotWidth / metersPerDegreeLng)
        )
        const pY = map.project(
            L.latLng(center.lat + plotHeight / 110540, center.lng)
        )
        const plotWidthPx = Math.abs(pX.x - p0.x)
        const plotHeightPx = Math.abs(pY.y - p0.y)
        const projected = coords.map(([lng, lat]) =>
            map.project(L.latLng(lat, lng))
        )
        const rotated = projected.map((pt) => ({
            x: pt.x * Math.cos(-angleRad) - pt.y * Math.sin(-angleRad),
            y: pt.x * Math.sin(-angleRad) + pt.y * Math.cos(-angleRad),
        }))
        const minX = Math.min(...rotated.map((p) => p.x))
        const maxX = Math.max(...rotated.map((p) => p.x))
        const minY = Math.min(...rotated.map((p) => p.y))
        const maxY = Math.max(...rotated.map((p) => p.y))
        const spaceHPx = plotWidthPx * (spaceH / plotWidth)
        const spaceVPx = plotHeightPx * (spaceV / plotHeight)
        if (plotWidth <= 0 || plotHeight <= 0) return []

        const polygons: L.Polygon[] = []
        let count = 0
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                const gx =
                    minX +
                    offsetXValue +
                    i * (plotWidthPx + spaceHPx) +
                    plotWidthPx / 2
                const gy =
                    minY +
                    offsetYValue +
                    j * (plotHeightPx + spaceVPx) +
                    plotHeightPx / 2
                const px = gx * Math.cos(angleRad) - gy * Math.sin(angleRad)
                const py = gx * Math.sin(angleRad) + gy * Math.cos(angleRad)
                const plotCenter = L.point(px, py)
                const plotCenterLatLng = map.unproject(plotCenter)
                const halfW = plotWidthPx / 2
                const halfH = plotHeightPx / 2
                const corners = [
                    [-halfW, -halfH],
                    [halfW, -halfH],
                    [halfW, halfH],
                    [-halfW, halfH],
                    [-halfW, -halfH],
                ]
                const plotCoords = corners.map(([dx, dy]) => {
                    const cx = gx + dx
                    const cy = gy + dy
                    const fx = cx * Math.cos(angleRad) - cy * Math.sin(angleRad)
                    const fy = cx * Math.sin(angleRad) + cy * Math.cos(angleRad)
                    const ptPx = L.point(fx, fy)
                    const latlng = map.unproject(ptPx)
                    return [latlng.lat, latlng.lng]
                })
                const turfPoly = {
                    type: 'Polygon',
                    coordinates: [
                        coords[0][0] !== coords[coords.length - 1][0] ||
                        coords[0][1] !== coords[coords.length - 1][1]
                            ? [...coords, coords[0]]
                            : coords,
                    ],
                } as Polygon
                const allCornersInside = plotCoords.every(([lat, lng]) =>
                    booleanPointInPolygon(
                        {
                            type: 'Point',
                            coordinates: [lng, lat],
                        } as import('geojson').Point,
                        turfPoly,
                        { ignoreBoundary: false }
                    )
                )
                if (allCornersInside) {
                    const poly = L.polygon(plotCoords as [number, number][], {
                        color: 'orange',
                        fillOpacity: 0.2,
                        weight: 1,
                        dashArray: '4,2',
                        interactive: false,
                    })
                    poly.addTo(map)
                    polygons.push(poly)
                    count++
                    if (count >= 2500) break
                }
            }
            if (count >= 2500) break
        }
        preview = polygons
        return polygons
    }

    /**
     * Retire de la carte tous les polygones passés en argument (retour de previewFieldPlot)
     */
    static removePreviewPolygons() {
        preview.forEach((p) => getMapRef().removeLayer(p))
    }
}
