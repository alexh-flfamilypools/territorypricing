'use client'

import React, { useState, useEffect } from 'react'
import { Territory, PricingTier } from '@/lib/types'

interface Props {
  territories: Territory[]
  selectedId: string | null
  drawingMode: boolean
  onSelectTerritory: (id: string | null) => void
  onUpdateTerritory: (id: string, updates: Partial<Territory>) => void
  onDeleteTerritory: (id: string) => void
  onStartDrawing: () => void
  onCancelDrawing: () => void
  onResetDefaults: () => void
}

const ZONE_LABELS = ['Zone A – Premium', 'Zone B – Standard', 'Zone C – Extended', 'Zone D – Outlying', 'Zone E – Custom']

export default function TerritoryPanel({
  territories,
  selectedId,
  drawingMode,
  onSelectTerritory,
  onUpdateTerritory,
  onDeleteTerritory,
  onStartDrawing,
  onCancelDrawing,
  onResetDefaults,
}: Props) {
  const selected = territories.find((t) => t.id === selectedId) ?? null
  const [editName, setEditName] = useState('')
  const [editPricing, setEditPricing] = useState<PricingTier>({
    label: '',
    basePrice: 0,
    pricePerSqFt: undefined,
    notes: '',
  })

  useEffect(() => {
    if (selected) {
      setEditName(selected.name)
      setEditPricing({ ...selected.pricing })
    }
  }, [selected])

  const handleSave = () => {
    if (!selected) return
    onUpdateTerritory(selected.id, {
      name: editName,
      pricing: editPricing,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h1 className="text-base font-semibold text-gray-900">SW Florida Territory Pricing</h1>
        <p className="text-xs text-gray-500 mt-0.5">Click a territory to edit · Draw to add new</p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-b border-gray-200 flex gap-2 flex-wrap">
        {drawingMode ? (
          <button
            onClick={onCancelDrawing}
            className="flex-1 py-1.5 px-3 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium transition-colors"
          >
            Cancel Drawing
          </button>
        ) : (
          <button
            onClick={onStartDrawing}
            className="flex-1 py-1.5 px-3 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium transition-colors"
          >
            + Draw Territory
          </button>
        )}
        <button
          onClick={onResetDefaults}
          title="Reset to default territories"
          className="py-1.5 px-3 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      {drawingMode && (
        <div className="mx-4 mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-md text-xs text-indigo-800">
          <strong>Drawing mode active.</strong> Click on the map to place polygon vertices. Double-click to close the shape.
        </div>
      )}

      {/* Territory list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Territories ({territories.length})
          </p>
        </div>
        <ul className="px-2 pb-2 space-y-1">
          {territories.map((t) => (
            <li key={t.id}>
              <button
                onClick={() => onSelectTerritory(t.id === selectedId ? null : t.id)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition-colors ${
                  t.id === selectedId
                    ? 'bg-indigo-50 border border-indigo-300'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-sm flex-shrink-0 border border-black/10"
                  style={{ backgroundColor: t.color }}
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-gray-800 truncate">{t.name}</span>
                  <span className="block text-xs text-gray-400 truncate">{t.pricing.label}</span>
                </span>
                <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  ${t.pricing.basePrice}
                </span>
              </button>
            </li>
          ))}
          {territories.length === 0 && (
            <li className="text-center py-8 text-gray-400 text-sm">
              No territories yet. Draw one on the map.
            </li>
          )}
        </ul>
      </div>

      {/* Edit panel */}
      {selected && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Edit Territory</h2>
            <button
              onClick={() => {
                if (confirm(`Delete "${selected.name}"?`)) {
                  onDeleteTerritory(selected.id)
                }
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Territory Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Zone label */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Pricing Zone</label>
            <select
              value={editPricing.label}
              onChange={(e) => setEditPricing((p) => ({ ...p, label: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            >
              {ZONE_LABELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Base price */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Base Price ($)</label>
            <input
              type="number"
              min={0}
              step={5}
              value={editPricing.basePrice}
              onChange={(e) =>
                setEditPricing((p) => ({ ...p, basePrice: Number(e.target.value) }))
              }
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Price per sq ft */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price / sq ft ($)</label>
            <input
              type="number"
              min={0}
              step={0.05}
              value={editPricing.pricePerSqFt ?? ''}
              onChange={(e) =>
                setEditPricing((p) => ({
                  ...p,
                  pricePerSqFt: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="Optional"
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={editPricing.notes ?? ''}
              onChange={(e) =>
                setEditPricing((p) => ({ ...p, notes: e.target.value }))
              }
              className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none"
              placeholder="Neighborhoods, notes…"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>

          <p className="text-xs text-gray-400 text-center">
            Drag polygon vertices on the map to reshape the territory.
          </p>
        </div>
      )}
    </aside>
  )
}
