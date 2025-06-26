import { MapContainer, TileLayer } from 'react-leaflet'
import BloomeoLayer from './BloomeoLayer'
import GeomanControls from './GeomanControls'
import Timeline from '../Timeline'

export default function MapWrapper() {
    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                position: 'relative',
            }}
        >
            <MapContainer
                center={[48.202, -2.8785]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                />
                <BloomeoLayer />
                <GeomanControls />
            </MapContainer>
            <Timeline />
        </div>
    )
}
