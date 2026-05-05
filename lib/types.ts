export interface LatLng {
  lat: number
  lng: number
}

export interface PricingTier {
  label: string
  basePrice: number
  pricePerSqFt?: number
  notes?: string
}

export interface Territory {
  id: string
  name: string
  color: string
  opacity: number
  coordinates: LatLng[]
  pricing: PricingTier
  createdAt: string
  updatedAt: string
}
