import 'leaflet';

declare module 'leaflet' {
  interface LayerOptions{
    bloomeoId?:string
  }
}