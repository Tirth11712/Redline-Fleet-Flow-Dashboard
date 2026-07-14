'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const GEOAPIFY_KEY = '6a8e31ef63394b80bae903e701d73434'

// A custom animated div icon for the truck
const createTruckIcon = () => {
  return L.divIcon({
    className: 'custom-truck-icon',
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid rgba(239,68,68,0.5); animation: pulse 2s infinite;"></div>
        <div style="background: rgba(239,68,68,0.9); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; z-index: 2; box-shadow: 0 0 10px rgba(239,68,68,0.8);">
          🚛
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

// A component to auto-fit the map bounds based on markers
function MapBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
    }
  }, [bounds, map])
  return null
}

interface TripRouteProps {
  marker: any
}

function TripRoute({ marker }: TripRouteProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([])
  const [currentPos, setCurrentPos] = useState<[number, number]>(marker.originCoords)
  
  useEffect(() => {
    let isMounted = true
    
    // Fetch the actual road route from Geoapify Routing API
    const fetchRoute = async () => {
      try {
        const waypoints = `${marker.originCoords[0]},${marker.originCoords[1]}|${marker.destCoords[0]},${marker.destCoords[1]}`
        const url = `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=truck&apiKey=${GEOAPIFY_KEY}`
        const res = await fetch(url)
        const data = await res.json()
        
        if (isMounted && data.features && data.features.length > 0) {
          // Geoapify returns coordinates as [lon, lat], Leaflet needs [lat, lon]
          const coords = data.features[0].geometry.coordinates[0].map((c: number[]) => [c[1], c[0]])
          setRouteCoords(coords)
        } else if (isMounted) {
          // Fallback to straight line if routing fails
          setRouteCoords([marker.originCoords, marker.destCoords])
        }
      } catch (err) {
        if (isMounted) {
          setRouteCoords([marker.originCoords, marker.destCoords])
        }
      }
    }
    
    fetchRoute()
    
    return () => { isMounted = false }
  }, [marker.originCoords, marker.destCoords])

  // Interpolate position along the route based on progress
  useEffect(() => {
    if (routeCoords.length === 0) return

    const targetProgress = marker.progress // 0 to 1
    
    if (routeCoords.length === 1) {
      setCurrentPos(routeCoords[0])
      return
    }

    // A simple interpolation across the coordinate array
    const totalSegments = routeCoords.length - 1
    const exactIndex = targetProgress * totalSegments
    const lowerIndex = Math.floor(exactIndex)
    const upperIndex = Math.ceil(exactIndex)
    
    if (lowerIndex === upperIndex) {
      setCurrentPos(routeCoords[lowerIndex])
    } else {
      const segmentProgress = exactIndex - lowerIndex
      const p1 = routeCoords[lowerIndex]
      const p2 = routeCoords[upperIndex]
      
      const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress
      const lon = p1[1] + (p2[1] - p1[1]) * segmentProgress
      setCurrentPos([lat, lon])
    }
  }, [marker.progress, routeCoords])

  if (routeCoords.length === 0) return null

  // Red line for completed path, grey line for remaining path
  const completedIndex = Math.floor(marker.progress * (routeCoords.length - 1))
  const completedPath = routeCoords.slice(0, completedIndex + 1)
  if (completedPath.length > 0 && currentPos) {
    completedPath.push(currentPos)
  }
  
  const remainingPath = currentPos ? [currentPos, ...routeCoords.slice(completedIndex + 1)] : routeCoords

  return (
    <>
      {/* Remaining Path */}
      <Polyline positions={remainingPath} color="rgba(255,255,255,0.2)" weight={3} dashArray="5, 10" />
      
      {/* Completed Path */}
      <Polyline positions={completedPath} color="rgba(239,68,68,0.8)" weight={4} />

      {/* Origin/Destination Markers */}
      <Marker position={marker.originCoords} icon={L.divIcon({ className: 'bg-zinc-500 rounded-full border-2 border-white', iconSize: [12, 12] })} />
      <Marker position={marker.destCoords} icon={L.divIcon({ className: 'bg-primary rounded-full border-2 border-white', iconSize: [16, 16] })} />

      {/* Live Truck Marker */}
      <Marker position={currentPos} icon={createTruckIcon()}>
        <Popup className="custom-popup">
          <div className="font-mono bg-zinc-950 text-white p-2 text-xs border border-primary/50">
            <p className="text-primary font-bold">{marker.tripRef}</p>
            <p className="text-zinc-300">{marker.driverName}</p>
            <p className="text-zinc-400">{marker.vehicleName}</p>
            <p className="mt-2 text-zinc-500">{Math.round(marker.progress * 100)}% COMPLETE</p>
          </div>
        </Popup>
      </Marker>
    </>
  )
}

export default function MapComponent({ tripMarkers }: { tripMarkers: any[] }) {
  // Calculate bounding box to fit all active routes
  const bounds = useMemo(() => {
    if (tripMarkers.length === 0) return null
    const b = L.latLngBounds([])
    tripMarkers.forEach(m => {
      b.extend(m.originCoords)
      b.extend(m.destCoords)
    })
    return b
  }, [tripMarkers])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { background: #09090b; font-family: var(--font-mono); }
        .leaflet-popup-content-wrapper { background: #09090b; border: 1px solid rgba(239,68,68,0.5); border-radius: 4px; padding: 0; }
        .leaflet-popup-tip { background: #09090b; border-top: 1px solid rgba(239,68,68,0.5); border-left: 1px solid rgba(239,68,68,0.5); }
        .leaflet-popup-content { margin: 0; }
        .custom-truck-icon { background: transparent; border: none; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}} />
      <MapContainer 
        center={[51.505, -0.09]} 
        zoom={3} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          url={`https://maps.geoapify.com/v1/tile/dark-matter/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`}
          attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a>'
        />
        
        {tripMarkers.map(marker => (
          <TripRoute key={marker.tripRef} marker={marker} />
        ))}

        <MapBounds bounds={bounds} />
      </MapContainer>
    </>
  )
}
