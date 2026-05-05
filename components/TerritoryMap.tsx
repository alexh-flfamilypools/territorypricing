'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  DrawingManager,
} from '@react-google-maps/api'
import { Territory, LatLng } from '@/lib/types'
import { SWFL_CENTER, SWFL_ZOOM } from '@/lib/territories'

const LIBRARIES: ('drawing' | 'geometry')[] = ['drawing', 'geometry']

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
  mapTypeControlOptions: {
    style: 2, // DROPDOWN_MENU
  },
}

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
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: LIBRARIES,
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const polygonRefs = useRef<Map<string, google.maps.Polygon>>(new Map())
  const [activeDrawingMode, setActiveDrawingMode] =
    useState<google.maps.drawing.OverlayType | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    setActiveDrawingMode(
      drawingMode ? google.maps.drawing.OverlayType.POLYGON : null
    )
  }, [drawingMode, isLoaded])

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const handlePolygonComplete = useCallback(
    (polygon: google.maps.Polygon) => {
      const path = polygon.getPath()
      const coords: LatLng[] = []
      for (let i = 0; i < path.getLength(); i++) {
        const pt = path.getAt(i)
        coords.push({ lat: pt.lat(), lng: pt.lng() })
      }
      // Remove the temporary drawing polygon — we'll manage our own
      polygon.setMap(null)
      onTerritoryDrawn(coords)
    },
    [onTerritoryDrawn]
  )

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
    polygonRefs.current.delete(id)
  }, [])

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-red-600 text-sm p-4">
        Failed to load Google Maps. Check your API key in{' '}
        <code className="ml-1">.env.local</code>.
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

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={SWFL_CENTER}
      zoom={SWFL_ZOOM}
      options={MAP_OPTIONS}
      onLoad={handleMapLoad}
      onClick={() => onSelectTerritory(null)}
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
            onClick={() => onSelectTerritory(territory.id)}
            onLoad={(polygon) => handlePolygonLoad(territory.id, polygon)}
            onUnmount={() => handlePolygonUnmount(territory.id)}
          />
        )
      })}

      {drawingMode && (
        <DrawingManager
          drawingMode={activeDrawingMode}
          options={{
            drawingControl: false,
            polygonOptions: {
              fillColor: '#6366F1',
              fillOpacity: 0.35,
              strokeColor: '#6366F1',
              strokeWeight: 2,
              editable: true,
            },
          }}
          onPolygonComplete={handlePolygonComplete}
        />
      )}
    </GoogleMap>
  )
}
