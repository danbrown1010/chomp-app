import { useRef, useState } from 'react'
import { IconChevronRight } from '../components/icons'
import Map, { Source, Layer, Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAppStore } from '../store/index'
import { useFireData } from '../hooks/useFireData'

const MAP_STYLE   = 'https://tiles.openfreemap.org/styles/liberty'
const CURRENT_POS = [-120.8830, 47.4521]
const PEEK_H      = 120

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
  const { accent, location } = useAppStore()
  const { fires } = useFireData()
  const mapRef = useRef(null)
  const [layers,   setLayers]   = useState(() => Object.fromEntries(LAYER_CONFIG.map(l => [l.id, l.on])))
  const [expanded, setExpanded] = useState(false)

  const toggleLayer = id => setLayers(prev => ({ ...prev, [id]: !prev[id] }))

  const recenter = () => {
    if (location && mapRef.current) {
      mapRef.current.flyTo({ center: [location.lng, location.lat], zoom: 14, duration: 1000 })
    }
  }

  return (
    <div className="relative h-full overflow-hidden" style={{ flex: 1, minHeight: 0 }}>

      {/* ── Map ──────────────────────────────────────────────────────────────── */}
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={{
          longitude: location?.lng ?? CURRENT_POS[0],
          latitude:  location?.lat ?? CURRENT_POS[1],
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {fires && layers.fire && (
          <Source id="fires" type="geojson" data={fires}>
            <Layer id="fire-fill"    type="fill" paint={{ 'fill-color': '#C4521A', 'fill-opacity': 0.15 }} />
            <Layer id="fire-outline" type="line" paint={{ 'line-color': '#C4521A', 'line-width': 1.5, 'line-opacity': 0.8 }} />
          </Source>
        )}

        {layers.route && (
          <Source id="route" type="geojson" data={ROUTE_GEOJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{ 'line-color': accent, 'line-width': 2.5, 'line-dasharray': [3, 2], 'line-opacity': 0.9 }}
              layout={{ 'line-cap': 'butt', 'line-join': 'round' }}
            />
          </Source>
        )}

        {location && (
          <Marker longitude={location.lng} latitude={location.lat} anchor="center">
            <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', width: 32, height: 32, borderRadius: '50%', background: `${accent}33`, animation: 'gps-pulse 2s ease-out infinite' }} />
              <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: `${accent}4d`, animation: 'gps-pulse 2s ease-out infinite', animationDelay: '0.5s' }} />
              <div style={{ position: 'relative', width: 12, height: 12, borderRadius: '50%', background: accent, border: '2.5px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', zIndex: 1 }} />
            </div>
          </Marker>
        )}

        {WAYPOINTS.map(wp => (
          <Marker key={wp.id} longitude={wp.coords[0]} latitude={wp.coords[1]} anchor="bottom">
            <WaypointPin label={`${wp.name} · ${wp.night}`} accent={accent} />
          </Marker>
        ))}
      </Map>

      {/* ── Floating UI ──────────────────────────────────────────────────────── */}
      <StatusStrip />
      <LayerStrip layers={LAYER_CONFIG} active={layers} onToggle={toggleLayer} accent={accent} />
      <ZoomControls mapRef={mapRef} />
      <RecenterBtn onPress={recenter} accent={accent} />
      <BottomSheet expanded={expanded} onToggle={() => setExpanded(e => !e)} accent={accent} />
    </div>
  )
}

// ─── Status strip ─────────────────────────────────────────────────────────────

function StatusStrip() {
  return (
    <div style={{ position: 'absolute', top: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8, pointerEvents: 'none', zIndex: 10 }}>
      {['DAY 1/3', 'LTE', '87%'].map(label => (
        <div
          key={label}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe)', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.06em' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Layer toggle strip ───────────────────────────────────────────────────────

function LayerStrip({ layers, active, onToggle, accent }) {
  return (
    <div
      style={{ position: 'absolute', top: 52, left: 0, right: 0, display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}
    >
      {layers.map(l => (
        <button
          key={l.id}
          onClick={() => onToggle(l.id)}
          style={active[l.id]
            ? { background: accent, color: 'white', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-body)' }
            : { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'var(--font-body)' }
          }
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}

// ─── Markers ──────────────────────────────────────────────────────────────────

function WaypointPin({ label, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${accent}80`,
        color: 'var(--text-primary)',
        fontSize: 10,
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        padding: '4px 10px',
        borderRadius: 20,
        marginBottom: 4,
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>
        {label}
      </div>
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
        <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 20 7 20C7 20 14 12.25 14 7C14 3.13 10.87 0 7 0Z" fill={accent} />
        <circle cx="7" cy="7" r="2.8" fill="white" />
      </svg>
    </div>
  )
}

// ─── Zoom controls ────────────────────────────────────────────────────────────

function ZoomControls({ mapRef }) {
  return (
    <div style={{ position: 'absolute', right: 16, bottom: PEEK_H + 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[{ label: '+', method: 'zoomIn' }, { label: '−', method: 'zoomOut' }].map(({ label, method }) => (
        <button
          key={method}
          onClick={() => mapRef.current?.getMap()?.[method]()}
          style={{
            width: 40, height: 40,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 20, fontWeight: 700,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Recenter button ──────────────────────────────────────────────────────────

function RecenterBtn({ onPress, accent }) {
  return (
    <button
      onClick={onPress}
      style={{
        position: 'absolute', left: 16, bottom: PEEK_H + 16,
        width: 44, height: 44, borderRadius: '50%',
        background: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: 'white' }}>
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
        <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  )
}

// ─── Bottom sheet ─────────────────────────────────────────────────────────────

function BottomSheet({ expanded, onToggle, accent }) {
  return (
    <div
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        height: expanded ? 280 : PEEK_H,
        transition: 'height 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      {/* Drag handle */}
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 8 }}
      >
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--border)' }} />
      </button>

      {/* Peek content — always visible */}
      <div style={{ padding: '0 16px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Next waypoint</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>Handy Spring · 12mi</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button
            style={{ flex: 1, background: accent, color: 'white', fontSize: 14, fontWeight: 600, borderRadius: 12, padding: '9px 0', fontFamily: 'var(--font-body)', border: 'none' }}
          >
            Navigate
          </button>
          <button
            style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, borderRadius: 12, padding: '9px 0', fontFamily: 'var(--font-body)' }}
          >
            Add waypoint
          </button>
        </div>
      </div>

      {/* Expanded: waypoint list */}
      <div style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 16, marginBottom: 8, padding: '0 16px' }}>
          All waypoints
        </p>
        <div style={{ padding: '0 16px' }}>
          {WAYPOINTS.map((wp, i) => (
            <div key={wp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{wp.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{wp.night} · {wp.distanceMi}mi</p>
              </div>
              <IconChevronRight style={{ width: 16, height: 16, color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
