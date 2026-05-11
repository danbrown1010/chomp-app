import { useRef, useState } from 'react'
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE   = 'https://tiles.openfreemap.org/styles/liberty'
const CURRENT_POS = [-120.8830, 47.4521]
const PEEK_H      = 120  // bottom sheet peek height in px

const WAYPOINTS = [
  { id: 'w1', coords: [-120.9100, 47.4800], name: 'Handy Spring',   night: 'Night 1', distanceMi: 12 },
  { id: 'w2', coords: [-120.8200, 47.3900], name: 'Esmeralda Camp', night: 'Night 2', distanceMi: 18 },
]

const ROUTE_GEOJSON = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: {
    type: 'LineString',
    coordinates: [CURRENT_POS, ...WAYPOINTS.map(w => w.coords)],
  }}],
}

const LAYER_CONFIG = [
  { id: 'route',    label: 'Route',    on: true  },
  { id: 'fire',     label: 'Fire',     on: true  },
  { id: 'land',     label: 'Land',     on: false },
  { id: 'partners', label: 'Partners', on: false },
]

export default function TripPage() {
  const mapRef = useRef(null)
  const [layers,   setLayers]   = useState(() => Object.fromEntries(LAYER_CONFIG.map(l => [l.id, l.on])))
  const [expanded, setExpanded] = useState(false)

  const toggleLayer = id => setLayers(prev => ({ ...prev, [id]: !prev[id] }))

  const recenter = () =>
    mapRef.current?.getMap()?.flyTo({ center: CURRENT_POS, zoom: 11, duration: 800 })

  return (
    <div className="relative h-full overflow-hidden">

      {/* ── Map ──────────────────────────────────────────────────────────────── */}
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={{ longitude: CURRENT_POS[0], latitude: CURRENT_POS[1], zoom: 11 }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {layers.route && (
          <Source id="route" type="geojson" data={ROUTE_GEOJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{ 'line-color': '#f97316', 'line-width': 2.5, 'line-dasharray': [3, 2], 'line-opacity': 0.9 }}
              layout={{ 'line-cap': 'butt', 'line-join': 'round' }}
            />
          </Source>
        )}

        <Marker longitude={CURRENT_POS[0]} latitude={CURRENT_POS[1]} anchor="center">
          <CurrentPosMarker />
        </Marker>

        {WAYPOINTS.map(wp => (
          <Marker key={wp.id} longitude={wp.coords[0]} latitude={wp.coords[1]} anchor="bottom">
            <WaypointPin label={`${wp.name} · ${wp.night}`} />
          </Marker>
        ))}
      </Map>

      {/* ── Floating UI ──────────────────────────────────────────────────────── */}
      <LayerStrip   layers={LAYER_CONFIG} active={layers} onToggle={toggleLayer} />
      <ZoomControls mapRef={mapRef} />
      <RecenterBtn  onPress={recenter} />
      <BottomSheet  expanded={expanded} onToggle={() => setExpanded(e => !e)} />
    </div>
  )
}

// ─── Layer toggle strip ───────────────────────────────────────────────────────

function LayerStrip({ layers, active, onToggle }) {
  return (
    <div
      className="absolute top-3 left-0 right-0 flex gap-2 overflow-x-auto px-4"
      style={{ scrollbarWidth: 'none' }}
    >
      {layers.map(l => (
        <button
          key={l.id}
          onClick={() => onToggle(l.id)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow transition-colors ${
            active[l.id]
              ? 'bg-[#f97316] text-white'
              : 'bg-[#1c1c1c]/90 text-[#6b7280] border border-[#3a3a3a]'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

// ─── Markers ──────────────────────────────────────────────────────────────────

function CurrentPosMarker() {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <div className="absolute w-4 h-4 rounded-full bg-[#f97316] animate-ping opacity-50" />
      <div className="w-3 h-3 rounded-full bg-[#f97316] border-2 border-white shadow" />
    </div>
  )
}

function WaypointPin({ label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#1a1a1a] border border-[#3b82f6]/50 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full mb-1 shadow-lg whitespace-nowrap">
        {label}
      </div>
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
        <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 3.13 10.87 0 7 0Z" fill="#3b82f6"/>
        <circle cx="7" cy="7" r="2.8" fill="white"/>
      </svg>
    </div>
  )
}

// ─── Zoom controls ────────────────────────────────────────────────────────────

function ZoomControls({ mapRef }) {
  return (
    <div className="absolute right-4 flex flex-col gap-1" style={{ bottom: PEEK_H + 16 }}>
      {[{ label: '+', method: 'zoomIn' }, { label: '−', method: 'zoomOut' }].map(({ label, method }) => (
        <button
          key={method}
          onClick={() => mapRef.current?.getMap()?.[method]()}
          className="w-10 h-10 bg-[#1c1c1c]/90 border border-[#3a3a3a] rounded-xl flex items-center justify-center text-white font-bold text-base shadow active:bg-[#2a2a2a] transition-colors"
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Recenter button ──────────────────────────────────────────────────────────

function RecenterBtn({ onPress }) {
  return (
    <button
      onClick={onPress}
      className="absolute left-4 w-11 h-11 bg-[#f97316] rounded-full flex items-center justify-center shadow-lg active:bg-[#c2410c] transition-colors"
      style={{ bottom: PEEK_H + 16 }}
    >
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────────

function BottomSheet({ expanded, onToggle }) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 bg-[#111] border-t border-[#2a2a2a] rounded-t-2xl overflow-hidden"
      style={{ height: expanded ? 280 : PEEK_H, transition: 'height 0.28s cubic-bezier(0.32,0.72,0,1)' }}
    >
      {/* Drag handle */}
      <button
        onClick={onToggle}
        className="w-full flex justify-center pt-2.5 pb-2 active:bg-[#1a1a1a] transition-colors"
      >
        <div className="w-10 h-1.5 rounded-full bg-[#555]" />
      </button>

      {/* Peek content — always visible */}
      <div className="px-4">
        <p className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-widest">Next waypoint</p>
        <p className="text-base font-semibold text-white mt-0.5">Handy Spring · 12mi</p>
        <div className="flex gap-2.5 mt-3">
          <button className="flex-1 bg-[#f97316] text-white text-sm font-semibold rounded-xl py-2 active:bg-[#c2410c] transition-colors">
            Navigate
          </button>
          <button className="flex-1 border border-[#3a3a3a] text-white text-sm font-semibold rounded-xl py-2 active:bg-[#1c1c1c] transition-colors">
            Add waypoint
          </button>
        </div>
      </div>

      {/* Expanded: waypoint list */}
      <div
        className="transition-opacity duration-200"
        style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none' }}
      >
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mt-4 mb-2 px-4">
          All waypoints
        </p>
        <div className="px-4 divide-y divide-[#2a2a2a]">
          {WAYPOINTS.map(wp => (
            <div key={wp.id} className="flex items-center gap-3 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{wp.name}</p>
                <p className="text-xs text-[#6b7280]">{wp.night} · {wp.distanceMi}mi</p>
              </div>
              <svg className="w-4 h-4 text-[#4b5563] shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
