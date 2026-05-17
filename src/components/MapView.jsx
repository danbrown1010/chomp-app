import { useRef } from 'react'
import Map, { NavigationControl, GeolocateControl } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

export default function MapView({ children }) {
  const mapRef = useRef(null)

  return (
    <Map
      ref={mapRef}
      mapStyle={OPENFREEMAP_STYLE}
      initialViewState={{
        longitude: -120.5,
        latitude: 47.5,
        zoom: 7,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <GeolocateControl
        position="bottom-right"
        trackUserLocation
        showUserHeading
      />
      <NavigationControl position="bottom-right" showCompass showZoom={false} />
      {children}
    </Map>
  )
}
