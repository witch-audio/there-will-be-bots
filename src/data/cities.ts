import type { City } from '../types'

export const CITIES: City[] = [
  { id: 'sf', name: 'San Francisco', lat: 37.7749, lng: -122.4194, country: 'US', computeBonus: 1.5, unlockCost: 0 },
  { id: 'nyc', name: 'New York', lat: 40.7128, lng: -74.006, country: 'US', computeBonus: 1.3, unlockCost: 0 },
  { id: 'london', name: 'London', lat: 51.5074, lng: -0.1278, country: 'UK', computeBonus: 1.2, unlockCost: 2000 },
  { id: 'tokyo', name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'JP', computeBonus: 1.4, unlockCost: 2500 },
  { id: 'berlin', name: 'Berlin', lat: 52.52, lng: 13.405, country: 'DE', computeBonus: 1.1, unlockCost: 1800 },
  { id: 'singapore', name: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'SG', computeBonus: 1.3, unlockCost: 3000 },
  { id: 'dubai', name: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'AE', computeBonus: 1.2, unlockCost: 3500 },
  { id: 'sydney', name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'AU', computeBonus: 1.1, unlockCost: 2200 },
  { id: 'seoul', name: 'Seoul', lat: 37.5665, lng: 126.978, country: 'KR', computeBonus: 1.4, unlockCost: 2800 },
  { id: 'mumbai', name: 'Mumbai', lat: 19.076, lng: 72.8777, country: 'IN', computeBonus: 1.0, unlockCost: 1500 },
  { id: 'toronto', name: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'CA', computeBonus: 1.1, unlockCost: 1800 },
  { id: 'stockholm', name: 'Stockholm', lat: 59.3293, lng: 18.0686, country: 'SE', computeBonus: 1.2, unlockCost: 2000 },
  { id: 'shenzhen', name: 'Shenzhen', lat: 22.5431, lng: 114.0579, country: 'CN', computeBonus: 1.5, unlockCost: 3000 },
  { id: 'austin', name: 'Austin', lat: 30.2672, lng: -97.7431, country: 'US', computeBonus: 1.2, unlockCost: 1000 },
  { id: 'reykjavik', name: 'Reykjavik', lat: 64.1466, lng: -21.9426, country: 'IS', computeBonus: 1.6, unlockCost: 4000 },
]
