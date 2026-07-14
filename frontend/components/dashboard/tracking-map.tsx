'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useFleetData } from '../shell/data-context'
import { getVehicle, getDriver } from '@/lib/data'
import { Navigation2, RefreshCw, Wifi } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import the map component so Leaflet only runs on the client
const MapComponent = dynamic(() => import('./map-component'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
      <div className="font-mono text-xs text-muted-foreground animate-pulse flex items-center gap-2">
        <Wifi className="size-4 animate-pulse" /> INITIALIZING LEAFLET ENGINE...
      </div>
    </div>
  )
})

// ─── Geoapify API Key ───────────────────────────────────────────────────────
const GEOAPIFY_KEY = '6a8e31ef63394b80bae903e701d73434'

// ─── Geo Cache (prevents repeated API calls for same location) ───────────────
const coordCache = new Map<string, [number, number]>()

async function geocode(location: string): Promise<[number, number] | null> {
  const cached = coordCache.get(location)
  if (cached) return cached

  try {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${GEOAPIFY_KEY}`
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    if (json.features?.length > 0) {
      const [lon, lat] = json.features[0].geometry.coordinates
      const coords: [number, number] = [lat, lon]
      coordCache.set(location, coords)
      return coords
    }
  } catch (e) {
    console.error('Geocoding error:', e)
  }
  return null
}

// ─── Simulate vehicle position between origin and destination ─────────────────
function interpolatePosition(
  origin: [number, number],
  dest: [number, number],
  progress: number
): [number, number] {
  return [
    origin[0] + (dest[0] - origin[0]) * progress,
    origin[1] + (dest[1] - origin[1]) * progress,
  ]
}

interface TripMarker {
  tripRef: string
  vehicleName: string
  driverName: string
  origin: string
  destination: string
  originCoords: [number, number]
  destCoords: [number, number]
  currentPosition: [number, number]
  progress: number // 0..1
  cargoKg: number
}

export function TrackingMap() {
  const { trips, vehicles, drivers } = useFleetData()
  const [tripMarkers, setTripMarkers] = useState<TripMarker[]>([])
  const [selectedTrip, setSelectedTrip] = useState<TripMarker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const progressRef = useRef<Record<string, number>>({})
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const activeTrips = trips.filter(t => t.status === 'Dispatched')

  // Map projection constants (simple equirectangular for the world view)
  const MAP_W = 960
  const MAP_H = 500
  const lon2x = (lon: number) => ((lon + 180) / 360) * MAP_W
  const lat2y = (lat: number) => ((90 - lat) / 180) * MAP_H

  const loadTrips = useCallback(async () => {
    setIsLoading(true)
    const markers: TripMarker[] = []

    for (const trip of activeTrips) {
      const vehicle = getVehicle(trip.vehicleId, vehicles)
      const driver = getDriver(trip.driverId, drivers)

      const [originCoords, destCoords] = await Promise.all([
        geocode(trip.origin),
        geocode(trip.destination),
      ])

      if (originCoords && destCoords) {
        // Get or initialize progress for this trip (simulates live movement)
        if (!(trip.id in progressRef.current)) {
          progressRef.current[trip.id] = Math.random() * 0.4 + 0.1 // start 10-50% through
        }
        const progress = progressRef.current[trip.id]
        const currentPosition = interpolatePosition(originCoords, destCoords, progress)

        markers.push({
          tripRef: trip.ref,
          vehicleName: vehicle ? `${vehicle.reg} — ${vehicle.name}` : 'Unknown Vehicle',
          driverName: driver?.name ?? 'Unknown Driver',
          origin: trip.origin,
          destination: trip.destination,
          originCoords,
          destCoords,
          currentPosition,
          progress,
          cargoKg: trip.cargoKg,
        })
      }
    }

    setTripMarkers(markers)
    setLastUpdate(new Date())
    setIsLoading(false)
  }, [activeTrips, vehicles, drivers])

  // Initial load
  useEffect(() => {
    loadTrips()
  }, [trips, vehicles, drivers])

  // Animate vehicle positions every 3 seconds (simulates live movement)
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setTripMarkers(prev =>
        prev.map(marker => {
          const id = Object.keys(progressRef.current).find(
            k => progressRef.current[k] === marker.progress
          )
          // Advance progress 1-3% per tick
          const newProgress = Math.min(marker.progress + Math.random() * 0.02 + 0.005, 0.98)
          progressRef.current[marker.tripRef] = newProgress
          return {
            ...marker,
            progress: newProgress,
            currentPosition: interpolatePosition(marker.originCoords, marker.destCoords, newProgress),
          }
        })
      )
      setLastUpdate(new Date())
    }, 3000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tripMarkers.length])

  // (Map boundaries and projections are now handled inside MapComponent)

  return (
    <div className="w-full border border-border bg-background overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${activeTrips.length > 0 ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {activeTrips.length > 0
              ? `${activeTrips.length} ACTIVE DISPATCH${activeTrips.length > 1 ? 'ES' : ''} — LIVE TELEMETRY`
              : 'NO ACTIVE DISPATCHES — AWAITING MISSIONS'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] text-muted-foreground/60">
            UPDATED {lastUpdate.toLocaleTimeString()}
          </span>
          <button
            onClick={loadTrips}
            disabled={isLoading}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Map area */}
      <div className="relative" style={{ height: 380 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
            <div className="font-mono text-xs text-muted-foreground animate-pulse flex items-center gap-2">
              <Wifi className="size-4 animate-pulse" /> RESOLVING COORDINATES VIA GEOAPIFY...
            </div>
          </div>
        )}

        {!isLoading && tripMarkers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Navigation2 className="size-10 text-muted-foreground/30" />
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              No dispatched trips to track
            </p>
            <p className="font-mono text-[9px] text-muted-foreground/50 uppercase text-center max-w-xs">
              Create a trip and set its status to &quot;Dispatched&quot; to see live tracking here
            </p>
          </div>
        )}

        {/* Interactive Leaflet Map using Geoapify */}
        {tripMarkers.length > 0 && (
          <div className="relative w-full h-full">
            <MapComponent tripMarkers={tripMarkers} />

            {/* Trip detail cards at bottom */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 overflow-x-auto z-[400] pointer-events-none">
              {tripMarkers.map(marker => (
                <div
                  key={marker.tripRef}
                  className={`shrink-0 border transition-all ${
                    selectedTrip?.tripRef === marker.tripRef
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-background/90 hover:border-primary/50'
                  } p-2 backdrop-blur-md pointer-events-auto shadow-xl`}
                  onClick={() => setSelectedTrip(selectedTrip?.tripRef === marker.tripRef ? null : marker)}
                >
                  <p className="font-mono text-[9px] text-primary tracking-widest uppercase">{marker.tripRef}</p>
                  <p className="font-mono text-[9px] text-foreground mt-0.5">{marker.driverName}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">{marker.origin.split(',')[0]} → {marker.destination.split(',')[0]}</p>
                  <div className="mt-1 h-0.5 bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000"
                      style={{ width: `${Math.round(marker.progress * 100)}%` }}
                    />
                  </div>
                  <p className="font-mono text-[8px] text-muted-foreground/60 mt-0.5">{Math.round(marker.progress * 100)}% COMPLETE</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-1.5 flex justify-between items-center">
        <span className="font-mono text-[8px] text-muted-foreground/40 uppercase">
          Geocoding powered by Geoapify · Positions update every 3s
        </span>
        <span className="font-mono text-[8px] text-muted-foreground/40 uppercase">
          Click a vehicle to inspect
        </span>
      </div>
    </div>
  )
}
