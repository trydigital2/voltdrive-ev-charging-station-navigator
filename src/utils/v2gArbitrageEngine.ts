export type GridDischargeMode = 'MAX_REVENUE_ARBITRAGE' | 'EMERGENCY_PEAK_SHAVING' | 'SCHEDULED_DEPARTURE_PROTECTED';

export interface V2gSessionConfig {
  batteryCapacityKwh: number;
  currentSocPercent: number;
  minDepartureSocPercent: number; // e.g. 50% reserve for travel
  bidirectionalInverterMaxKw: number; // e.g. 11 kW or 22 kW DC
  offPeakBuyRatePaisePerKwh: number; // e.g. ₹6.50/kWh (650 paise)
  peakGridExportRatePaisePerKwh: number; // e.g. ₹18.00/kWh (1800 paise)
  gridDischargeDurationHours: number;
}

export interface V2gArbitrageMetrics {
  usableEnergyForExportKwh: number;
  effectiveDischargePowerKw: number;
  energyExportedKwh: number;
  grossRevenuePaise: number;
  batteryThroughputCostPaise: number; // Battery wear / cycle cost (approx ₹2.5/kWh)
  netProfitPaise: number;
  formattedNetProfit: string;
  co2OffsetKg: number;
  finalSocPercent: number;
  isDepartureBufferSafe: boolean;
}

/**
 * Calculates financial arbitrage yield for ISO 15118-20 Vehicle-to-Grid energy dispatch.
 * Net Profit = (Peak Export Tariff - Off-Peak Buy Tariff - Degradation Cost) * Energy Dispatched
 */
export function calculateV2gArbitrage(config: V2gSessionConfig): V2gArbitrageMetrics {
  const safeCurrentSoc = Math.max(10, Math.min(100, config.currentSocPercent));
  const safeReserveSoc = Math.max(20, Math.min(90, config.minDepartureSocPercent));

  const availableSocSpan = Math.max(0, safeCurrentSoc - safeReserveSoc);
  const usableEnergyForExportKwh = Math.round(((availableSocSpan / 100) * config.batteryCapacityKwh) * 10) / 10;

  // Maximum energy that can be discharged over the session duration
  const theoreticalExportKwh = config.bidirectionalInverterMaxKw * config.gridDischargeDurationHours;
  const energyExportedKwh = Math.min(usableEnergyForExportKwh, theoreticalExportKwh);

  // Rate delta
  const tariffSpreadPaise = Math.max(0, config.peakGridExportRatePaisePerKwh - config.offPeakBuyRatePaisePerKwh);
  const grossRevenuePaise = Math.round(energyExportedKwh * tariffSpreadPaise);

  // Battery wear amortization (~250 paise / ₹2.50 per kWh throughput)
  const batteryThroughputCostPaise = Math.round(energyExportedKwh * 250);
  const netProfitPaise = Math.max(0, grossRevenuePaise - batteryThroughputCostPaise);

  // Grid green offset: 0.82 kg CO2 avoided per kWh of fossil peak-shaving
  const co2OffsetKg = Math.round(energyExportedKwh * 0.82 * 10) / 10;

  const actualSocDrained = (energyExportedKwh / config.batteryCapacityKwh) * 100;
  const finalSocPercent = Math.round(safeCurrentSoc - actualSocDrained);

  return {
    usableEnergyForExportKwh,
    effectiveDischargePowerKw: config.bidirectionalInverterMaxKw,
    energyExportedKwh,
    grossRevenuePaise,
    batteryThroughputCostPaise,
    netProfitPaise,
    formattedNetProfit: `₹${(netProfitPaise / 100).toFixed(0)}`,
    co2OffsetKg,
    finalSocPercent,
    isDepartureBufferSafe: finalSocPercent >= safeReserveSoc,
  };
}

export function getDefaultV2gConfig(): V2gSessionConfig {
  return {
    batteryCapacityKwh: 60,
    currentSocPercent: 88,
    minDepartureSocPercent: 50,
    bidirectionalInverterMaxKw: 11,
    offPeakBuyRatePaisePerKwh: 650,
    peakGridExportRatePaisePerKwh: 1800,
    gridDischargeDurationHours: 2.0,
  };
}
