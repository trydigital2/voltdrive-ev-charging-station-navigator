export interface RouteWaypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  distanceFromStartKm: number;
  isChargingStop: boolean;
  chargingSpeedKw?: number;
}

export interface TerrainConsumptionFactors {
  baseConsumptionWhPerKm: number; // e.g. 160 Wh/km on flat dry pavement
  ambientTemperatureC: number;
  elevationDeltaMeters: number;
  cabinAcActive: boolean;
}

export interface RouteEnergyForecast {
  totalDistanceKm: number;
  grossEnergyConsumedKwh: number;
  regenEnergyRecoveredKwh: number;
  netEnergyRequiredKwh: number;
  startSocPercent: number;
  estimatedArrivalSocPercent: number;
  recommendedChargingStopName?: string;
  isRangeAnxietyTriggered: boolean;
}

/**
 * Calculates net energy consumption considering elevation climbs and regenerative braking.
 * Climbing requires additional potential energy: Delta E_climb = (m * g * Delta h) / efficiency.
 * Descending recovers kinetic energy via regenerative braking with ~65% recovery efficiency.
 */
export function calculateRouteEnergyConsumption(
  distanceKm: number,
  elevationClimbMeters: number,
  elevationDescentMeters: number,
  factors: TerrainConsumptionFactors,
  batteryCapacityKwh: number = 60,
  startSocPercent: number = 75
): RouteEnergyForecast {
  const baseWh = distanceKm * factors.baseConsumptionWhPerKm;

  // Temperature efficiency curve: optimum 22C. Below 10C drops 20%, above 35C drops 15% due to compressor.
  let tempFactor = 1.0;
  if (factors.ambientTemperatureC < 10) {
    tempFactor = 1.2;
  } else if (factors.ambientTemperatureC > 35) {
    tempFactor = 1.15;
  }

  // Cabin AC compressor draws ~1.8 kW constant
  const acWh = factors.cabinAcActive ? (distanceKm / 70) * 1800 : 0;

  // Elevation physics: EV curb weight ~1800 kg. 100m climb = ~650 Wh additional energy
  const climbExtraWh = (elevationClimbMeters / 100) * 650;
  // Regenerative braking recovers ~65% of potential energy on descent
  const regenWh = (elevationDescentMeters / 100) * 650 * 0.65;

  const grossWh = (baseWh * tempFactor) + acWh + climbExtraWh;
  const netWh = Math.max(100, grossWh - regenWh);

  const grossEnergyConsumedKwh = Math.round((grossWh / 1000) * 10) / 10;
  const regenEnergyRecoveredKwh = Math.round((regenWh / 1000) * 10) / 10;
  const netEnergyRequiredKwh = Math.round((netWh / 1000) * 10) / 10;

  const socUsedPercent = (netEnergyRequiredKwh / batteryCapacityKwh) * 100;
  const rawArrivalSoc = startSocPercent - socUsedPercent;
  const estimatedArrivalSocPercent = Math.round(Math.max(-20, rawArrivalSoc));

  // Trigger warning if arrival SoC is below 15% buffer margin
  const isRangeAnxietyTriggered = estimatedArrivalSocPercent < 15;

  return {
    totalDistanceKm: distanceKm,
    grossEnergyConsumedKwh,
    regenEnergyRecoveredKwh,
    netEnergyRequiredKwh,
    startSocPercent,
    estimatedArrivalSocPercent,
    recommendedChargingStopName: isRangeAnxietyTriggered
      ? 'VoltDrive Expressway Oasis Hub (KM 42)'
      : undefined,
    isRangeAnxietyTriggered,
  };
}

export function getSampleDelhiJaipurWaypoints(): RouteWaypoint[] {
  return [
    {
      id: 'WP-1',
      name: 'Indira Gandhi Int Airport (Start)',
      latitude: 28.5562,
      longitude: 77.1000,
      elevationMeters: 228,
      distanceFromStartKm: 0,
      isChargingStop: false,
    },
    {
      id: 'WP-2',
      name: 'VoltDrive Highway Oasis Superhub',
      latitude: 28.3812,
      longitude: 77.0125,
      elevationMeters: 265,
      distanceFromStartKm: 46.5,
      isChargingStop: true,
      chargingSpeedKw: 150,
    },
    {
      id: 'WP-3',
      name: 'Shahpura Valley Overlook',
      latitude: 27.3912,
      longitude: 75.9612,
      elevationMeters: 382,
      distanceFromStartKm: 185.0,
      isChargingStop: false,
    },
    {
      id: 'WP-4',
      name: 'Jaipur Pink City Gates (Destination)',
      latitude: 26.9124,
      longitude: 75.7873,
      elevationMeters: 431,
      distanceFromStartKm: 268.0,
      isChargingStop: false,
    },
  ];
}
