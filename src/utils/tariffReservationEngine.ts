export type TariffZoneType = 'SOLAR_OFF_PEAK' | 'NORMAL_HOURS' | 'EVENING_PEAK';

export interface TariffZone {
  type: TariffZoneType;
  label: string;
  timeWindow: string; // e.g. "10:00 - 16:00"
  ratePaisePerKwh: number;
  formattedRate: string;
  isCurrentZone: boolean;
}

export interface SlotHoldReservation {
  reservationId: string;
  stationId: string;
  gunId: string;
  driverId: string;
  createdTimestampIso: string;
  expiryTimestampIso: string;
  secondsRemaining: number;
  isHoldActive: boolean;
  penaltyFreeCancellationWindowSec: number;
  reservedKw: number;
}

/**
 * Returns active Time-of-Day (ToD) tariff zones and calculates driver savings.
 */
export function getTodTariffMatrix(currentHour: number = 13): {
  zones: TariffZone[];
  activeZone: TariffZone;
  solarSavingsPotentialPaisePerKwh: number;
} {
  const isSolar = currentHour >= 10 && currentHour < 16;
  const isPeak = currentHour >= 18 && currentHour < 22;
  const isNormal = !isSolar && !isPeak;

  const zones: TariffZone[] = [
    {
      type: 'SOLAR_OFF_PEAK',
      label: 'Solar Green Window',
      timeWindow: '10:00 - 16:00',
      ratePaisePerKwh: 550, // ₹5.50/kWh
      formattedRate: '₹5.50/kWh',
      isCurrentZone: isSolar,
    },
    {
      type: 'NORMAL_HOURS',
      label: 'Standard Grid Rate',
      timeWindow: '06:00 - 10:00 & 16:00 - 18:00',
      ratePaisePerKwh: 1100, // ₹11.00/kWh
      formattedRate: '₹11.00/kWh',
      isCurrentZone: isNormal,
    },
    {
      type: 'EVENING_PEAK',
      label: 'Peak Demand Window',
      timeWindow: '18:00 - 22:00',
      ratePaisePerKwh: 1850, // ₹18.50/kWh
      formattedRate: '₹18.50/kWh',
      isCurrentZone: isPeak,
    },
  ];

  const activeZone = zones.find((z) => z.isCurrentZone) || zones[0];
  const peakRate = zones.find((z) => z.type === 'EVENING_PEAK')?.ratePaisePerKwh || 1850;
  const solarSavingsPotentialPaisePerKwh = peakRate - zones[0].ratePaisePerKwh;

  return {
    zones,
    activeZone,
    solarSavingsPotentialPaisePerKwh,
  };
}

/**
 * Initializes a 15-minute guaranteed connector hold.
 */
export function createSlotHoldReservation(
  stationId: string,
  gunId: string,
  reservedKw: number = 150
): SlotHoldReservation {
  const now = Date.now();
  const holdDurationMs = 15 * 60 * 1000;

  return {
    reservationId: `HOLD-VOLT-${Math.floor(1000 + Math.random() * 9000)}`,
    stationId,
    gunId,
    driverId: 'DRV-TRYDIGITAL-01',
    createdTimestampIso: new Date(now).toISOString(),
    expiryTimestampIso: new Date(now + holdDurationMs).toISOString(),
    secondsRemaining: 900,
    isHoldActive: true,
    penaltyFreeCancellationWindowSec: 300, // 5 mins free cancellation
    reservedKw,
  };
}
