import type { Review } from '@/lib/types';

export interface VehiclePreset {
  make: string;
  model: string;
  batteryCapacityKwh: number;
  rangeKm: number;
  connectorType: 'CCS' | 'CHAdeMO' | 'Type2' | 'Tesla' | 'GB/T';
}

export const VEHICLE_PRESETS: VehiclePreset[] = [
  { make: 'Tesla', model: 'Model 3', batteryCapacityKwh: 75, rangeKm: 358, connectorType: 'Tesla' },
  { make: 'Tesla', model: 'Model Y', batteryCapacityKwh: 78, rangeKm: 330, connectorType: 'Tesla' },
  { make: 'Tesla', model: 'Model S', batteryCapacityKwh: 100, rangeKm: 402, connectorType: 'Tesla' },
  { make: 'BYD', model: 'Atto 3', batteryCapacityKwh: 60, rangeKm: 521, connectorType: 'CCS' },
  { make: 'BYD', model: 'Seal', batteryCapacityKwh: 82, rangeKm: 575, connectorType: 'CCS' },
  { make: 'Tata', model: 'Nexon EV', batteryCapacityKwh: 40, rangeKm: 312, connectorType: 'CCS' },
  { make: 'Tata', model: 'Tigor EV', batteryCapacityKwh: 26, rangeKm: 315, connectorType: 'CCS' },
  { make: 'MG', model: 'ZS EV', batteryCapacityKwh: 50, rangeKm: 461, connectorType: 'CCS' },
  { make: 'Mahindra', model: 'XUV400', batteryCapacityKwh: 39, rangeKm: 456, connectorType: 'CCS' },
  { make: 'Ather', model: '450X', batteryCapacityKwh: 3.7, rangeKm: 146, connectorType: 'Type2' },
  { make: 'Ola', model: 'S1 Pro', batteryCapacityKwh: 4, rangeKm: 181, connectorType: 'Type2' },
  { make: 'Hyundai', model: 'Ioniq 5', batteryCapacityKwh: 77, rangeKm: 631, connectorType: 'CCS' },
  { make: 'Kia', model: 'EV6', batteryCapacityKwh: 77, rangeKm: 708, connectorType: 'CCS' },
];

export const DEMO_REVIEWS: Record<string, { author: string; rating: number; comment: string; date: string; broken?: boolean }[]> = {
  'a0000001-0000-0000-0000-000000000001': [
    { author: 'Rahul S.', rating: 5, comment: 'Super fast CCS charging, done in 20 minutes. The cafe is a great touch while waiting.', date: '2024-12-10' },
    { author: 'Priya M.', rating: 4, comment: 'Good station but one charger was occupied for over an hour. Otherwise clean and well maintained.', date: '2024-11-28' },
    { author: 'Amit K.', rating: 5, comment: 'Best charging experience in Mumbai. 24/7 access saved me on a late-night drive.', date: '2024-11-15' },
  ],
  'a0000001-0000-0000-0000-000000000003': [
    { author: 'Sneha R.', rating: 5, comment: 'Ultra-fast 350kW is incredible. Charged from 10 to 80 percent in under 15 minutes.', date: '2024-12-05' },
    { author: 'Vikram J.', rating: 4, comment: 'Great location in CP. Food court nearby makes the wait enjoyable.', date: '2024-11-20' },
  ],
  'a0000001-0000-0000-0000-000000000004': [
    { author: 'Deepak T.', rating: 2, comment: 'One of the chargers was broken and showed an error code. Reported it. Please fix ASAP.', date: '2024-12-01', broken: true },
  ],
  'a0000001-0000-0000-0000-000000000005': [
    { author: 'Ananya P.', rating: 5, comment: 'Best charging experience in Bangalore. Lounge is comfortable and WiFi is fast.', date: '2024-12-08' },
    { author: 'Karthik N.', rating: 5, comment: 'Super clean, well-lit, and the staff is helpful. Highly recommend.', date: '2024-11-22' },
  ],
  'a0000001-0000-0000-0000-000000000007': [
    { author: 'Meera D.', rating: 5, comment: 'Love that it is solar-powered. Clean energy charging clean cars. Brilliant concept.', date: '2024-12-03' },
  ],
  'a0000001-0000-0000-0000-000000000009': [
    { author: 'Arjun L.', rating: 4, comment: 'Great location in Hitech City. Having a Tesla connector is a bonus for Model 3 owners.', date: '2024-11-18' },
  ],
  'a0000001-0000-0000-0000-000000000011': [
    { author: 'Lakshmi V.', rating: 4, comment: 'Convenient on OMR. 24/7 access is very helpful for late-night drives to the airport.', date: '2024-12-06' },
  ],
};

export function getDemoReviews(stationId: string) {
  return DEMO_REVIEWS[stationId] ?? [];
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function predictQueueLength(occupiedCount: number, totalChargers: number, hour: number): number {
  const peakFactor = hour >= 8 && hour <= 11 ? 1.8 : hour >= 17 && hour <= 21 ? 2.2 : hour >= 12 && hour <= 14 ? 1.4 : 0.6;
  const baseQueue = occupiedCount * 0.5 * peakFactor;
  const ratio = totalChargers > 0 ? occupiedCount / totalChargers : 0;
  const surge = ratio > 0.7 ? Math.ceil(baseQueue * 1.3) : Math.round(baseQueue);
  return Math.max(0, surge);
}

export function predictWaitTime(queueLength: number, powerKw: number, avgBatteryKwh: number = 50): number {
  if (queueLength === 0) return 0;
  const avgChargeMinutes = Math.max(15, Math.min(60, (avgBatteryKwh * 60) / powerKw));
  return Math.round(queueLength * avgChargeMinutes);
}

export function getChargerSpeedCategory(powerKw: number): 'Normal' | 'Fast' | 'Ultra Fast' {
  if (powerKw >= 150) return 'Ultra Fast';
  if (powerKw >= 50) return 'Fast';
  return 'Normal';
}

export const CONNECTOR_COLORS: Record<string, string> = {
  CCS: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  CHAdeMO: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  Type2: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Tesla: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  'GB/T': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
};

export const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  occupied: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  offline: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/20',
  maintenance: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};
