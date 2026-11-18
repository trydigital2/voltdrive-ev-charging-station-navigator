export interface CellModuleTelemetry {
  moduleId: string;
  voltageVolts: number;
  temperatureC: number;
  internalImpedanceMilliOhms: number;
  balancingActive: boolean;
}

export interface BatteryHealthAnalysis {
  stateOfHealthPercent: number; // SOH % (e.g. 96.4%)
  factoryCapacityKwh: number;
  usableRemainingCapacityKwh: number;
  totalEquivalentChargeCycles: number;
  projectedUsefulLifeYears: number;
  cellDeltaVoltageMillivolts: number; // Max cell voltage - Min cell voltage (imbalance indicator)
  thermalRunawayRiskLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  coolingPumpRpm: number;
  recommendations: string[];
}

/**
 * Calculates battery degradation, cell impedance imbalance, and useful life projection.
 * Standard automotive degradation formula:
 * SOH = 100 - (alpha * sqrt(cycles) + beta * time_in_years)
 */
export function analyzeBatteryStateOfHealth(
  chargeCycles: number,
  batteryAgeYears: number,
  cellModules: CellModuleTelemetry[],
  nominalPackKwh: number = 60
): BatteryHealthAnalysis {
  // Cycle aging factor: ~0.15% per 100 cycles, Calendar aging: ~1.2% per year
  const cycleDegradation = (chargeCycles / 100) * 0.15;
  const calendarDegradation = batteryAgeYears * 1.2;
  const totalDegradation = cycleDegradation + calendarDegradation;

  const rawSoh = Math.max(70, 100 - totalDegradation);
  const stateOfHealthPercent = Math.round(rawSoh * 10) / 10;
  const usableRemainingCapacityKwh = Math.round(((stateOfHealthPercent / 100) * nominalPackKwh) * 10) / 10;

  // Compute cell imbalance
  const voltages = cellModules.map((c) => c.voltageVolts);
  const maxV = Math.max(...voltages);
  const minV = Math.min(...voltages);
  const cellDeltaVoltageMillivolts = Math.round((maxV - minV) * 1000);

  // Compute thermal metrics
  const maxTemp = Math.max(...cellModules.map((c) => c.temperatureC));
  let thermalRunawayRiskLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' = 'NOMINAL';
  let coolingPumpRpm = 1200;

  if (maxTemp > 45 || cellDeltaVoltageMillivolts > 60) {
    thermalRunawayRiskLevel = 'CRITICAL';
    coolingPumpRpm = 4500;
  } else if (maxTemp > 38 || cellDeltaVoltageMillivolts > 30) {
    thermalRunawayRiskLevel = 'ELEVATED';
    coolingPumpRpm = 2800;
  }

  // Estimated life remaining until 75% end-of-life retirement
  const remainingSohSpan = stateOfHealthPercent - 75;
  const annualDegradationRate = totalDegradation / Math.max(1, batteryAgeYears);
  const projectedUsefulLifeYears = Math.round((remainingSohSpan / Math.max(0.5, annualDegradationRate)) * 10) / 10;

  const recommendations: string[] = [];
  if (cellDeltaVoltageMillivolts > 25) {
    recommendations.push('Perform slow AC overnight balancing to equalize cell voltages.');
  }
  if (stateOfHealthPercent > 92) {
    recommendations.push('Battery pack health is in pristine tier (Grade A).');
  }
  recommendations.push('Keep DC fast-charging below 85% SoC during summer peaks.');

  return {
    stateOfHealthPercent,
    factoryCapacityKwh: nominalPackKwh,
    usableRemainingCapacityKwh,
    totalEquivalentChargeCycles: chargeCycles,
    projectedUsefulLifeYears,
    cellDeltaVoltageMillivolts,
    thermalRunawayRiskLevel,
    coolingPumpRpm,
    recommendations,
  };
}

export function getSampleCellTelemetry(): CellModuleTelemetry[] {
  return [
    { moduleId: 'MOD-01', voltageVolts: 3.782, temperatureC: 31.4, internalImpedanceMilliOhms: 1.2, balancingActive: false },
    { moduleId: 'MOD-02', voltageVolts: 3.778, temperatureC: 32.1, internalImpedanceMilliOhms: 1.3, balancingActive: true },
    { moduleId: 'MOD-03', voltageVolts: 3.785, temperatureC: 31.8, internalImpedanceMilliOhms: 1.2, balancingActive: false },
    { moduleId: 'MOD-04', voltageVolts: 3.774, temperatureC: 33.0, internalImpedanceMilliOhms: 1.4, balancingActive: true },
  ];
}
