import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Territory, LatLng } from '@/lib/types'
import {
  loadTerritories,
  saveTerritories,
  DEFAULT_TERRITORIES,
  getNextColor,
} from '@/lib/territories'
import TerritoryPanel from '@/components/TerritoryPanel'
import { v4 as uuidv4 } from 'uuid'

const TerritoryMap = lazy(() => import('@/components/TerritoryMap'))

export default function App() {
  const [territories, setTerritories] = useState<Territory[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawingMode, setDrawingMode] = useState(false)

  useEffect(() => {
    setTerritories(loadTerritories())
  }, [])

  useEffect(() => {
    if (territories.length > 0) saveTerritories(territories)
  }, [territories])

  const handleSelectTerritory = useCallback((id: string | null) => {
    setSelectedId(id)
    if (drawingMode) setDrawingMode(false)
  }, [drawingMode])

  const handleTerritoryDrawn = useCallback(
    (coords: LatLng[]) => {
      const newTerritory: Territory = {
        id: uuidv4(),
        name: `New Territory ${territories.length + 1}`,
        color: getNextColor(territories),
        opacity: 0.35,
        coordinates: coords,
        pricing: {
          label: 'Zone C – Extended',
          basePrice: 175,
          pricePerSqFt: 2.5,
          notes: '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setTerritories((prev) => [...prev, newTerritory])
      setSelectedId(newTerritory.id)
      setDrawingMode(false)
    },
    [territories]
  )

  const handleTerritoryEdited = useCallback((id: string, coords: LatLng[]) => {
    setTerritories((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, coordinates: coords, updatedAt: new Date().toISOString() } : t
      )
    )
  }, [])

  const handleUpdateTerritory = useCallback(
    (id: string, updates: Partial<Territory>) => {
      setTerritories((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      )
    },
    []
  )

  const handleDeleteTerritory = useCallback((id: string) => {
    setTerritories((prev) => prev.filter((t) => t.id !== id))
    setSelectedId(null)
  }, [])

  const handleResetDefaults = useCallback(() => {
    if (confirm('Reset all territories to default? This will discard any changes.')) {
      setTerritories(DEFAULT_TERRITORIES)
      setSelectedId(null)
    }
  }, [])

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
              Loading map…
            </div>
          }
        >
          <TerritoryMap
            territories={territories}
            selectedId={selectedId}
            drawingMode={drawingMode}
            onSelectTerritory={handleSelectTerritory}
            onTerritoryDrawn={handleTerritoryDrawn}
            onTerritoryEdited={handleTerritoryEdited}
          />
        </Suspense>
      </div>
      <TerritoryPanel
        territories={territories}
        selectedId={selectedId}
        drawingMode={drawingMode}
        onSelectTerritory={handleSelectTerritory}
        onUpdateTerritory={handleUpdateTerritory}
        onDeleteTerritory={handleDeleteTerritory}
        onStartDrawing={() => {
          setSelectedId(null)
          setDrawingMode(true)
        }}
        onCancelDrawing={() => setDrawingMode(false)}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  )
}
