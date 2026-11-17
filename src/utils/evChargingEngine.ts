export type PlugType = 'CCS2_DC_FAST' | 'TYPE_2_AC' | 'CHA_DE_MO' | 'GB_T';

export type StationOperationalStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'OFFLINE';

export interface ChargerGun {
  gunId: string;
  plugType: PlugType;
  maxOutputKw: number;
  voltageRangeVolts: string;
  tariffPerKwhPaise: number;
  status: StationOperationalStatus;
}

export interface EvChargingStation {
  stationId: string;
  name: string;
  operatorName: string;
  latitude: number;
  longitude: number;
  address: string;
  guns: ChargerGun[];
  amenities: string[];
  averageRating: number;
  open24x7: boolean;
}

export interface ChargingSessionEstimate {
  currentSocPercent: number;
  targetSocPercent: number;
  energyNeededKwh: number;
  estimatedDurationMinutes: number;
  energyCostPaise: number;
  gstPaise: number;
  totalCostPaise: number;
  formattedTotalCost: string;
  postChargeEstimatedRangeKm: number;
}

/**
 * Calculates battery charge session parameters with dynamic CC/CV charging taper.
 * Fast charging holds constant current up to ~80% SoC, then drops power exponentially to protect cell chemistry.
 */
export function calculateChargingSessionEstimate(
  currentSocPercent: number,
  targetSocPercent: number,
  batteryPackCapacityKwh: number = 60, // e.g. 60 kWh pack (standard EV)
  chargerPowerKw: number = 60,
  tariffPerKwhPaise: number = 1800, // ₹18/unit
  maxRangeKm: number = 420
): ChargingSessionEstimate {
  const safeCurrent = Math.max(5, Math.min(99, currentSocPercent));
  const safeTarget = Math.max(safeCurrent + 1, Math.min(100, targetSocPercent));
  
  const socDelta = safeTarget - safeCurrent;
  const energyNeededKwh = Math.round(((socDelta / 100) * batteryPackCapacityKwh) * 10) / 10;

  // Split into fast phase (<=80%) and taper phase (>80%)
  const currentInFast = Math.min(80, safeCurrent);
  const targetInFast = Math.min(80, safeTarget);
  const fastSocGain = Math.max(0, targetInFast - currentInFast);
  
  const currentInTaper = Math.max(80, safeCurrent);
  const targetInTaper = Math.max(80, safeTarget);
  const taperSocGain = Math.max(0, targetInTaper - currentInTaper);

  const fastPhaseKwh = (fastSocGain / 100) * batteryPackCapacityKwh;
  const taperPhaseKwh = (taperSocGain / 100) * batteryPackCapacityKwh;

  // In taper phase, average effective power drops to ~35% of peak charger output
  const fastHours = fastPhaseKwh / Math.max(10, chargerPowerKw);
  const taperHours = taperPhaseKwh / Math.max(7, chargerPowerKw * 0.35);

  const estimatedDurationMinutes = Math.max(5, Math.round((fastHours + taperHours) * 60));

  const energyCostPaise = Math.round(energyNeededKwh * tariffPerKwhPaise);
  const gstPaise = Math.round(energyCostPaise * 0.18); // 18% GST
  const totalCostPaise = energyCostPaise + gstPaise;

  const postChargeEstimatedRangeKm = Math.round((safeTarget / 100) * maxRangeKm);

  return {
    currentSocPercent: safeCurrent,
    targetSocPercent: safeTarget,
    energyNeededKwh,
    estimatedDurationMinutes,
    energyCostPaise,
    gstPaise,
    totalCostPaise,
    formattedTotalCost: `₹${(totalCostPaise / 100).toFixed(0)}`,
    postChargeEstimatedRangeKm,
  };
}

/**
 * Haversine formula to compute distance in km between vehicle GPS and charging station.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getSampleEvChargingStations(): EvChargingStation[] {
  return [
    {
      stationId: 'VOLT-EXP-081',
      name: 'VoltDrive CyberHub Ultra-Fast Hub',
      operatorName: 'Tata Power EZ Charge / VoltDrive Partner',
      latitude: 28.4952,
      longitude: 77.0891,
      address: 'Tower C, Cyber City Phase 2, DLF CyberHub',
      averageRating: 4.86,
      open24x7: true,
      amenities: ['☕ Coffee Shop', '🚻 Restroom', '📶 Free Wi-Fi', '🅿️ Free EV Parking'],
      guns: [
        {
          gunId: 'GUN-A1',
          plugType: 'CCS2_DC_FAST',
          maxOutputKw: 120,
          voltageRangeVolts: '200V - 1000V DC',
          tariffPerKwhPaise: 2150, // ₹21.50/kWh
          status: 'AVAILABLE',
        },
        {
          gunId: 'GUN-A2',
          plugType: 'CCS2_DC_FAST',
          maxOutputKw: 60,
          voltageRangeVolts: '200V - 750V DC',
          tariffPerKwhPaise: 1850,
          status: 'OCCUPIED',
        },
        {
          gunId: 'GUN-B1',
          plugType: 'TYPE_2_AC',
          maxOutputKw: 22,
          voltageRangeVolts: '415V 3-Phase AC',
          tariffPerKwhPaise: 1250,
          status: 'AVAILABLE',
        },
      ],
    },
    {
      stationId: 'VOLT-HIGH-402',
      name: 'Expressway Highway Oasis Superhub',
      operatorName: 'VoltDrive Highway Corridor',
      latitude: 28.3812,
      longitude: 77.0125,
      address: 'KM 42, Delhi-Jaipur Expressway Highway Plaza',
      averageRating: 4.92,
      open24x7: true,
      amenities: ['🍽️ Food Court', '🏪 24/7 Convenience Store', '🛝 Kids Play Area'],
      guns: [
        {
          gunId: 'GUN-HW-1',
          plugType: 'CCS2_DC_FAST',
          maxOutputKw: 150,
          voltageRangeVolts: '300V - 1000V DC',
          tariffPerKwhPaise: 2300,
          status: 'AVAILABLE',
        },
        {
          gunId: 'GUN-HW-2',
          plugType: 'CCS2_DC_FAST',
          maxOutputKw: 150,
          voltageRangeVolts: '300V - 1000V DC',
          tariffPerKwhPaise: 2300,
          status: 'AVAILABLE',
        },
      ],
    },
  ];
}
