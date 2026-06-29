import React, { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap, useJsApiLoader, Polygon, Polyline } from '@react-google-maps/api'
import { Territory, LatLng } from '@/lib/types'
import { SWFL_CENTER, SWFL_ZOOM } from '@/lib/territories'

// No extra libraries needed — DrawingManager was removed in Maps JS API v3.65
const LIBRARIES: never[] = []

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'roadmap',
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

interface Props {
  territories: Territory[]
  selectedId: string | null
  drawingMode: boolean
  onSelectTerritory: (id: string | null) => void
  onTerritoryDrawn: (coords: LatLng[]) => void
  onTerritoryEdited: (id: string, coords: LatLng[]) => void
}

export default function TerritoryMap({
  territories,
  selectedId,
  drawingMode,
  onSelectTerritory,
  onTerritoryDrawn,
  onTerritoryEdited,
}: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  const [pendingCoords, setPendingCoords] = useState<LatLng[]>([])

  // Keep refs current so stable callbacks always see the latest values
  const drawingModeRef = useRef(drawingMode)
  const onSelectTerritoryRef = useRef(onSelectTerritory)
  const onTerritoryDrawnRef = useRef(onTerritoryDrawn)
  const pendingCoordsRef = useRef<LatLng[]>([])

  useEffect(() => { drawingModeRef.current = drawingMode }, [drawingMode])
  useEffect(() => { onSelectTerritoryRef.current = onSelectTerritory }, [onSelectTerritory])
  useEffect(() => { onTerritoryDrawnRef.current = onTerritoryDrawn }, [onTerritoryDrawn])
  useEffect(() => { pendingCoordsRef.current = pendingCoords }, [pendingCoords])

  // Clear in-progress drawing when mode is cancelled
  useEffect(() => {
    if (!drawingMode) setPendingCoords([])
  }, [drawingMode])

  const polygonRefs = useRef<Map<string, google.maps.Polygon>>(new Map())

  // Single stable click handler — no prop changes between renders
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return
    if (drawingModeRef.current) {
      const coord: LatLng = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      setPendingCoords((prev) => [...prev, coord])
    } else {
      onSelectTerritoryRef.current(null)
    }
  }, []) // empty deps — reads via refs at call time

  // Double-click finishes the polygon; also fires a single click first so trim last point
  const handleMapDblClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!drawingModeRef.current || !e.latLng) return
    const current = pendingCoordsRef.current
    const trimmed = current.length > 0 ? current.slice(0, -1) : current
    if (trimmed.length >= 3) {
      setPendingCoords([])
      onTerritoryDrawnRef.current(trimmed)
    }
  }, []) // empty deps — reads via refs at call time

  const finishDrawing = useCallback(() => {
    const coords = pendingCoordsRef.current
    if (coords.length >= 3) {
      setPendingCoords([])
      onTerritoryDrawnRef.current(coords)
    }
  }, [])

  const cancelDrawing = useCallback(() => setPendingCoords([]), [])

  const getPathCoords = (polygon: google.maps.Polygon): LatLng[] => {
    const path = polygon.getPath()
    const coords: LatLng[] = []
    for (let i = 0; i < path.getLength(); i++) {
      const pt = path.getAt(i)
      coords.push({ lat: pt.lat(), lng: pt.lng() })
    }
    return coords
  }

  const attachPathListeners = useCallback(
    (id: string, polygon: google.maps.Polygon) => {
      const path = polygon.getPath()
      google.maps.event.clearListeners(path, 'set_at')
      google.maps.event.clearListeners(path, 'insert_at')
      google.maps.event.clearListeners(path, 'remove_at')
      const emit = () => onTerritoryEdited(id, getPathCoords(polygon))
      path.addListener('set_at', emit)
      path.addListener('insert_at', emit)
      path.addListener('remove_at', emit)
    },
    [onTerritoryEdited]
  )

  const handlePolygonLoad = useCallback(
    (id: string, polygon: google.maps.Polygon) => {
      polygonRefs.current.set(id, polygon)
      attachPathListeners(id, polygon)
    },
    [attachPathListeners]
  )

  const handlePolygonUnmount = useCallback((id: string) => {
    const polygon = polygonRefs.current.get(id)
    if (polygon) {
      const path = polygon.getPath()
      google.maps.event.clearListeners(path, 'set_at')
      google.maps.event.clearListeners(path, 'insert_at')
      google.maps.event.clearListeners(path, 'remove_at')
    }
    polygonRefs.current.delete(id)
  }, [])

  if (!MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-full bg-yellow-50 text-yellow-800 text-sm p-6 text-center">
        <div>
          <p className="font-semibold mb-1">Google Maps API key not configured.</p>
          <p>
            Set <code className="bg-yellow-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in
            your Vercel environment variables and redeploy.
          </p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 text-red-700 text-sm p-6 text-center">
        <div>
          <p className="font-semibold mb-1">Failed to load Google Maps.</p>
          <p>Check that your API key is valid and has the Maps JavaScript API enabled.</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
        Loading map…
      </div>
    )
  }

  const previewPath =
    pendingCoords.length > 1 ? [...pendingCoords, pendingCoords[0]] : pendingCoords

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={SWFL_CENTER}
        zoom={SWFL_ZOOM}
        options={MAP_OPTIONS}
        onClick={handleMapClick}
        onDblClick={handleMapDblClick}
      >
        {territories.map((territory) => {
          const isSelected = territory.id === selectedId
          return (
            <Polygon
              key={territory.id}
              paths={territory.coordinates}
              options={{
                fillColor: territory.color,
                fillOpacity: isSelected ? 0.55 : territory.opacity,
                strokeColor: territory.color,
                strokeOpacity: isSelected ? 1 : 0.8,
                strokeWeight: isSelected ? 3 : 1.5,
                editable: isSelected,
                draggable: false,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={() => {
                if (!drawingModeRef.current) onSelectTerritoryRef.current(territory.id)
              }}
              onLoad={(polygon) => handlePolygonLoad(territory.id, polygon)}
              onUnmount={() => handlePolygonUnmount(territory.id)}
            />
          )
        })}

        {pendingCoords.length > 0 && (
          <Polyline
            path={previewPath}
            options={{
              strokeColor: '#6366F1',
              strokeWeight: 2,
              strokeOpacity: 0.9,
            }}
          />
        )}
      </GoogleMap>

      {/* Drawing HUD */}
      {drawingMode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-white rounded-xl shadow-lg px-4 py-3 text-sm z-10 whitespace-nowrap">
          <span className="text-gray-600">
            {pendingCoords.length === 0
              ? 'Click map to place vertices'
              : pendingCoords.length < 3
              ? `${pendingCoords.length} point${pendingCoords.length > 1 ? 's' : ''} — need at least 3`
              : `${pendingCoords.length} points`}
          </span>
          {pendingCoords.length >= 3 && (
            <button
              onClick={finishDrawing}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
            >
              Finish Shape
            </button>
          )}
          {pendingCoords.length > 0 && (
            <button
              onClick={cancelDrawing}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
