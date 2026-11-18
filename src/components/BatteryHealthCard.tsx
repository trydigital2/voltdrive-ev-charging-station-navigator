import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  BatteryHealthAnalysis,
  analyzeBatteryStateOfHealth,
  getSampleCellTelemetry,
} from '../utils/batteryHealthEngine';

export const BatteryHealthCard: React.FC = () => {
  const cells = getSampleCellTelemetry();
  const [analysis, setAnalysis] = useState<BatteryHealthAnalysis>(
    analyzeBatteryStateOfHealth(340, 2.1, cells, 60)
  );

  const handleRunCalibration = () => {
    Alert.alert(
      'BMS Passive Balancing Triggered',
      `Cell delta voltage: ${analysis.cellDeltaVoltageMillivolts}mV. Active bleed resistors engaged on Module 02 & 04.`,
      [{ text: 'Dismiss' }]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔋 BATTERY BMS HEALTH</Text>
        </View>
        <Text style={styles.cyclesText}>{analysis.totalEquivalentChargeCycles} cycles</Text>
      </View>

      <Text style={styles.title}>Battery Pack State of Health (SOH)</Text>
      <Text style={styles.subtitle}>60 kWh Lithium-Ion NMC Pack Diagnostics</Text>

      {/* SOH Percentage Meter */}
      <View style={styles.sohMeterRow}>
        <View style={styles.sohCircle}>
          <Text style={styles.sohVal}>{analysis.stateOfHealthPercent}%</Text>
          <Text style={styles.sohSub}>SOH GRADE A</Text>
        </View>
        <View style={styles.sohDetailsCol}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Usable Capacity:</Text>
            <Text style={styles.detailVal}>
              {analysis.usableRemainingCapacityKwh} / {analysis.factoryCapacityKwh} kWh
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cell Delta (Delta V):</Text>
            <Text style={[styles.detailVal, { color: colors.primaryLight }]}>
              {analysis.cellDeltaVoltageMillivolts} mV (Nominal)
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Projected Useful Life:</Text>
            <Text style={styles.detailVal}>{analysis.projectedUsefulLifeYears} Years</Text>
          </View>
        </View>
      </View>

      {/* Cell Modules Grid */}
      <Text style={styles.sectionHeading}>Cell Module Voltage & Thermals</Text>
      <View style={styles.cellsGrid}>
        {cells.map((c) => (
          <View key={c.moduleId} style={styles.cellItem}>
            <Text style={styles.cellName}>{c.moduleId}</Text>
            <Text style={styles.cellV}>{c.voltageVolts.toFixed(3)}V</Text>
            <Text style={styles.cellTemp}>{c.temperatureC}°C</Text>
            {c.balancingActive && <Text style={styles.bleedTag}>BALANCING</Text>}
          </View>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.recBox}>
        {analysis.recommendations.map((rec, i) => (
          <Text key={i} style={styles.recItem}>
            • {rec}
          </Text>
        ))}
      </View>

      {/* Action */}
      <TouchableOpacity style={styles.actionBtn} onPress={handleRunCalibration} activeOpacity={0.8}>
        <Text style={styles.actionBtnText}>Trigger Passive Cell Balancing</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  cyclesText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sohMeterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    gap: 12,
  },
  sohCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sohVal: {
    fontSize: 16,
    fontWeight: typography.fontWeight.heavy,
    color: '#34D399',
  },
  sohSub: {
    fontSize: 8,
    color: '#A7F3D0',
    fontWeight: typography.fontWeight.bold,
  },
  sohDetailsCol: {
    flex: 1,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  detailVal: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cellsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.md,
  },
  cellItem: {
    flex: 1,
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  cellName: {
    fontSize: 9,
    color: colors.textMuted,
  },
  cellV: {
    fontSize: 11,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 2,
  },
  cellTemp: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 1,
  },
  bleedTag: {
    fontSize: 7,
    color: '#F59E0B',
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  recBox: {
    backgroundColor: '#0B0F19',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  recItem: {
    fontSize: 10,
    color: colors.textSecondary,
    marginVertical: 1,
  },
  actionBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
