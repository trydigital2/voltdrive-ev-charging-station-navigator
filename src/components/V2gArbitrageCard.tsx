import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  V2gSessionConfig,
  V2gArbitrageMetrics,
  calculateV2gArbitrage,
  getDefaultV2gConfig,
} from '../utils/v2gArbitrageEngine';

export const V2gArbitrageCard: React.FC = () => {
  const [config, setConfig] = useState<V2gSessionConfig>(getDefaultV2gConfig());
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const metrics: V2gArbitrageMetrics = calculateV2gArbitrage(config);

  const toggleExport = () => {
    setIsExporting(!isExporting);
    Alert.alert(
      isExporting ? 'V2G Export Halted' : 'V2G Grid Export Engaged',
      isExporting
        ? 'Bidirectional inverter transitioned to idle standby.'
        : `Injecting ${metrics.effectiveDischargePowerKw} kW back into DISCOM smart grid at ₹18.00/kWh tariff. Scheduled end SoC: ${metrics.finalSocPercent}%.`
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, isExporting && styles.badgeActive]}>
          <Text style={[styles.badgeText, isExporting && styles.badgeTextActive]}>
            {isExporting ? '⚡ ISO 15118-20 V2G DISPATCHING' : 'V2G ENERGY ARBITRAGE'}
          </Text>
        </View>
        <Text style={styles.tariffText}>Spread: +₹11.50/kWh</Text>
      </View>

      <Text style={styles.title}>Vehicle-to-Grid (V2G) Monetization</Text>
      <Text style={styles.subtitle}>Sell stored off-peak energy back to grid during evening peak</Text>

      {/* Financial Yield Highlight */}
      <View style={styles.yieldContainer}>
        <View style={styles.yieldCol}>
          <Text style={styles.yieldLabel}>Net Session Profit</Text>
          <Text style={styles.yieldAmount}>{metrics.formattedNetProfit}</Text>
          <Text style={styles.yieldSub}>After battery cycle amortisation</Text>
        </View>
        <View style={styles.yieldDivider} />
        <View style={styles.yieldCol}>
          <Text style={styles.yieldLabel}>CO2 Avoided</Text>
          <Text style={styles.co2Amount}>{metrics.co2OffsetKg} kg</Text>
          <Text style={styles.yieldSub}>Clean fossil replacement</Text>
        </View>
      </View>

      {/* Energy Telemetry Grid */}
      <View style={styles.telemetryGrid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Export Energy</Text>
          <Text style={styles.gridVal}>{metrics.energyExportedKwh} kWh</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Current SoC</Text>
          <Text style={styles.gridVal}>{config.currentSocPercent}%</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Departure Reserve</Text>
          <Text style={[styles.gridVal, { color: colors.primaryLight }]}>
            {config.minDepartureSocPercent}% Locked
          </Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Post-V2G SoC</Text>
          <Text style={[styles.gridVal, { color: colors.accent }]}>
            {metrics.finalSocPercent}%
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.exportButton, isExporting && styles.exportButtonActive]}
        onPress={toggleExport}
        activeOpacity={0.8}
      >
        <Text style={styles.exportButtonText}>
          {isExporting ? 'Stop V2G Grid Injection' : `Engage 11kW Bidirectional Export (${metrics.formattedNetProfit} Earn)`}
        </Text>
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
  badgeActive: {
    backgroundColor: '#083344',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: '#34D399',
    letterSpacing: 0.5,
  },
  badgeTextActive: {
    color: '#38BDF8',
  },
  tariffText: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.bold,
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
  yieldContainer: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  yieldCol: {
    alignItems: 'center',
    flex: 1,
  },
  yieldLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  yieldAmount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: '#34D399',
    marginTop: 2,
  },
  co2Amount: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.primaryLight,
    marginTop: 2,
  },
  yieldSub: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 2,
  },
  yieldDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  telemetryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  gridItem: {
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  gridVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  exportButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  exportButtonActive: {
    backgroundColor: '#DC2626',
  },
  exportButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
