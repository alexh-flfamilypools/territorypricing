import { Territory } from './types'

export const SWFL_CENTER = { lat: 26.4416, lng: -81.8004 }
export const SWFL_ZOOM = 10

export const TERRITORY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
]

// Pre-seeded territories covering major Southwest Florida areas.
// Coordinates are approximate polygon boundaries for each zone.
export const DEFAULT_TERRITORIES: Territory[] = [
  {
    id: 'naples-core',
    name: 'Naples Core',
    color: '#3B82F6',
    opacity: 0.35,
    pricing: {
      label: 'Zone A – Premium',
      basePrice: 250,
      pricePerSqFt: 3.5,
      notes: 'Downtown Naples, Old Naples, Port Royal',
    },
    coordinates: [
      { lat: 26.1750, lng: -81.8300 },
      { lat: 26.1750, lng: -81.7400 },
      { lat: 26.0900, lng: -81.7400 },
      { lat: 26.0900, lng: -81.8300 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'north-naples',
    name: 'North Naples',
    color: '#10B981',
    opacity: 0.35,
    pricing: {
      label: 'Zone B – Standard',
      basePrice: 200,
      pricePerSqFt: 2.75,
      notes: 'Pelican Bay, Vanderbilt Beach, Tiburon',
    },
    coordinates: [
      { lat: 26.2800, lng: -81.8300 },
      { lat: 26.2800, lng: -81.7400 },
      { lat: 26.1750, lng: -81.7400 },
      { lat: 26.1750, lng: -81.8300 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bonita-springs',
    name: 'Bonita Springs',
    color: '#F59E0B',
    opacity: 0.35,
    pricing: {
      label: 'Zone B – Standard',
      basePrice: 195,
      pricePerSqFt: 2.6,
      notes: 'Bonita Beach, Bonita Bay, Spring Creek',
    },
    coordinates: [
      { lat: 26.3800, lng: -81.8300 },
      { lat: 26.3800, lng: -81.7400 },
      { lat: 26.2800, lng: -81.7400 },
      { lat: 26.2800, lng: -81.8300 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'estero',
    name: 'Estero / Miromar',
    color: '#8B5CF6',
    opacity: 0.35,
    pricing: {
      label: 'Zone C – Extended',
      basePrice: 185,
      pricePerSqFt: 2.4,
      notes: 'Miromar Lakes, Estero, Coconut Point',
    },
    coordinates: [
      { lat: 26.4400, lng: -81.8300 },
      { lat: 26.4400, lng: -81.7400 },
      { lat: 26.3800, lng: -81.7400 },
      { lat: 26.3800, lng: -81.8300 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fort-myers',
    name: 'Fort Myers',
    color: '#EF4444',
    opacity: 0.35,
    pricing: {
      label: 'Zone C – Extended',
      basePrice: 180,
      pricePerSqFt: 2.3,
      notes: 'Downtown Fort Myers, McGregor, Iona',
    },
    coordinates: [
      { lat: 26.6800, lng: -81.9200 },
      { lat: 26.6800, lng: -81.7800 },
      { lat: 26.5500, lng: -81.7800 },
      { lat: 26.5500, lng: -81.9200 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cape-coral',
    name: 'Cape Coral',
    color: '#EC4899',
    opacity: 0.35,
    pricing: {
      label: 'Zone C – Extended',
      basePrice: 175,
      pricePerSqFt: 2.2,
      notes: 'Cape Coral, Matlacha, Pine Island',
    },
    coordinates: [
      { lat: 26.7200, lng: -82.0500 },
      { lat: 26.7200, lng: -81.9200 },
      { lat: 26.5500, lng: -81.9200 },
      { lat: 26.5500, lng: -82.0500 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'marco-island',
    name: 'Marco Island',
    color: '#14B8A6',
    opacity: 0.35,
    pricing: {
      label: 'Zone A – Premium',
      basePrice: 275,
      pricePerSqFt: 4.0,
      notes: 'Marco Island, Isles of Capri',
    },
    coordinates: [
      { lat: 26.0900, lng: -81.7400 },
      { lat: 26.0900, lng: -81.6400 },
      { lat: 25.9200, lng: -81.6400 },
      { lat: 25.9200, lng: -81.7400 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'lehigh-acres',
    name: 'Lehigh Acres',
    color: '#F97316',
    opacity: 0.35,
    pricing: {
      label: 'Zone D – Outlying',
      basePrice: 160,
      pricePerSqFt: 2.0,
      notes: 'Lehigh Acres, Gateway',
    },
    coordinates: [
      { lat: 26.6500, lng: -81.7800 },
      { lat: 26.6500, lng: -81.5500 },
      { lat: 26.5200, lng: -81.5500 },
      { lat: 26.5200, lng: -81.7800 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const STORAGE_KEY = 'swfl-territories'

export function loadTerritories(): Territory[] {
  if (typeof window === 'undefined') return DEFAULT_TERRITORIES
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as Territory[]
  } catch {
    // fall through to defaults
  }
  return DEFAULT_TERRITORIES
}

export function saveTerritories(territories: Territory[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(territories))
}

export function getNextColor(existing: Territory[]): string {
  const usedColors = new Set(existing.map((t) => t.color))
  return (
    TERRITORY_COLORS.find((c) => !usedColors.has(c)) ?? TERRITORY_COLORS[existing.length % TERRITORY_COLORS.length]
  )
}
