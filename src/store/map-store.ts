import { Map } from 'leaflet'
import { IItem, managerAtom, store } from './global-store'
import { produce } from 'immer'
import L from 'leaflet'
import { addPlot } from './plot-store'
import { atom } from 'jotai'

let mapRef: L.Map
export const drawnInProgressAtom = atom(false)
export const inCreationAtom = atom<any>(null)

export function setMapRef(map: L.Map) {
    mapRef = map
}
export function getMapRef() {
    return mapRef
}
export abstract class MapHelper {
    // static drawObject() {
    //   const map = mapRef;
    //   const objects = store.get(managerAtom) as Record<string, IItem | undefined>;

    //   if (!map || !objects) return;

    //   const newObjects = produce(objects, (draft) => {
    //   Object.values(draft).forEach((obj) => {
    //     if (!obj||obj.ref) return;

    //     if (obj.type === "PLOT" && obj.geo.geometry.type === "Polygon") {
    //       // Conversion des coordonnées GeoJSON [lng, lat] => [lat, lng]
    //       const rawCoordinates = obj.geo.geometry.coordinates as any;
    //       const coordinates = rawCoordinates.map((ring: any) =>
    //         ring.map((point: any) => [point[1], point[0]])
    //       );
    //       const polygon = L.polygon(coordinates, {
    //         pmIgnore: false,
    //         color: 'red',
    //         fillColor: 'blue',
    //         fillOpacity: 0.4

    //       });
    //       polygon.addTo(map);
    //       obj.ref = polygon; // Store the Leaflet polygon reference
    //       console.log('Polygon coordinates:', coordinates);

    //     } else if (obj.type === "PATH" && obj.geo.geometry.type === "LineString") {
    //       const coordinates = (obj.geo.geometry.coordinates as [number, number][]);
    //       const polyline = L.polyline(coordinates, { pmIgnore: false });
    //       polyline.addTo(map);
    //       obj.ref = polyline;

    //     }
    //   });
    // })
    // store.set(managerAtom, newObjects);
    // }

    static addPlot() {
        if (mapRef.pm) {
            mapRef.once('pm:create', (e) => {
                const layer = e.layer
                const geojson = (layer as L.Polygon).toGeoJSON()
                if (geojson.geometry.type !== 'Polygon') return
                addPlot(geojson.geometry)
                layer.remove()
            })
            mapRef.pm.enableDraw('Polygon', {
                snappable: true,

                templineStyle: { color: 'red', radius: 5 },
                hintlineStyle: { color: 'orange', dashArray: [5, 5] },
            })
            // Tu peux aussi stocker ici une info de contexte (ex: set un flag dans le state)
        }
    }
}
