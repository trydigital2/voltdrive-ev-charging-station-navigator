import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  SlotHoldReservation,
  createSlotHoldReservation,
  getTodTariffMatrix,
} from '../utils/tariffReservationEngine';

interface TariffReservationModalProps {
  stationId?: string;
  gunId?: string;
  maxKw?: number;
}

export const TariffReservationModal: React.FC<TariffReservationModalProps> = ({
  stationId = 'VOLT-EXP-081',
  gunId = 'GUN-A1',
  maxKw = 150,
}) => {
  const { zones, activeZone, solarSavingsPotentialPaisePerKwh } = getTodTariffMatrix(13); // 1 PM solar hour
  const [reservation, setReservation] = useState<SlotHoldReservation | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(900); // 15 min

  const handleCreateReservation = () => {
    const res = createSlotHoldReservation(stationId, gunId, maxKw);
    setReservation(res);
    setSecondsLeft(900);
    Alert.alert(
      '15-Minute Slot Hold Active! ⚡',
      `Gun ${gunId} (${maxKw}kW) held for your vehicle. Current green tariff: ${activeZone.formattedRate}.`
    );
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚡ TIME-OF-DAY TARIFF MATRIX</Text>
        </View>
        <Text style={styles.rateHighlight}>{activeZone.formattedRate}</Text>
      </View>

      <Text style={styles.title}>Dynamic DISCOM Tariff & Slot Hold</Text>
      <Text style={styles.subtitle}>
        Save up to ₹{(solarSavingsPotentialPaisePerKwh / 100).toFixed(2)}/kWh by charging during Solar Windows
      </Text>

      {/* Tariff Zones Comparison */}
      <View style={styles.zonesContainer}>
        {zones.map((z) => (
          <View key={z.type} style={[styles.zoneRow, z.isCurrentZone && styles.zoneRowActive]}>
            <View style={styles.zoneDotCol}>
              <View style={[styles.zoneDot, z.isCurrentZone && styles.zoneDotActive]} />
            </View>
            <View style={styles.zoneInfo}>
              <Text style={[styles.zoneLabel, z.isCurrentZone && styles.zoneLabelActive]}>
                {z.label} {z.isCurrentZone && '• ACTIVE NOW'}
              </Text>
              <Text style={styles.zoneWindow}>{z.timeWindow}</Text>
            </View>
            <Text style={[styles.zoneRate, z.isCurrentZone && styles.zoneRateActive]}>
              {z.formattedRate}
            </Text>
          </View>
        ))}
      </View>

      {/* Reservation Hold Box */}
      {reservation ? (
        <View style={styles.timerBox}>
          <Text style={styles.timerTitle}>Guaranteed Connector Hold Active</Text>
          <Text style={styles.countdown}>{formatTimer(secondsLeft)}</Text>
          <Text style={styles.timerSub}>
            Holding {reservation.reservedKw}kW {reservation.gunId} • Arrive within window
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.reserveBtn}
          onPress={handleCreateReservation}
          activeOpacity={0.8}
        >
          <Text style={styles.reserveBtnText}>Lock 15-Minute Guaranteed Slot Hold</Text>
        </TouchableOpacity>
      )}
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
  rateHighlight: {
    fontSize: typography.fontSize.xs,
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.heavy,
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
  zonesContainer: {
    gap: 6,
    marginBottom: spacing.md,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoneRowActive: {
    borderColor: colors.primary,
    backgroundColor: '#064E3B',
  },
  zoneDotCol: {
    marginRight: spacing.sm,
  },
  zoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  zoneDotActive: {
    backgroundColor: '#34D399',
  },
  zoneInfo: {
    flex: 1,
  },
  zoneLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  zoneLabelActive: {
    color: colors.white,
  },
  zoneWindow: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  zoneRate: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
  },
  zoneRateActive: {
    color: '#34D399',
  },
  timerBox: {
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  timerTitle: {
    fontSize: 10,
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
  countdown: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.heavy,
    color: '#34D399',
    marginVertical: 4,
  },
  timerSub: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  reserveBtn: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  reserveBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
