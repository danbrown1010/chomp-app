import MapView from '../components/MapView'

export default function TripPage() {
  return (
    <div className="relative flex flex-col h-full">
      <MapView />

      <div className="absolute bottom-4 left-4 right-4 bg-[#111]/90 backdrop-blur border border-[#2a2a2a] rounded-xl p-4">
        <p className="text-xs text-[#6b7280] uppercase tracking-wider font-semibold mb-1">Active trip</p>
        <p className="text-white font-semibold">No active trip</p>
        <button className="mt-3 w-full bg-[#f97316] text-white text-sm font-semibold rounded-lg py-2.5 active:bg-[#c2410c] transition-colors">
          Plan a trip
        </button>
      </div>
    </div>
  )
}
