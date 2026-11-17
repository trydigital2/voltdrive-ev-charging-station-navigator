import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  EvChargingStation,
  calculateChargingSessionEstimate,
  calculateHaversineDistanceKm,
} from '../utils/evChargingEngine';

interface EvChargingStationCardProps {
  station: EvChargingStation;
  userCoords?: { lat: number; lon: number };
  onSlotBooked?: (stationId: string, gunId: string) => void;
}

export const EvChargingStationCard: React.FC<EvChargingStationCardProps> = ({
  station,
  userCoords = { lat: 28.501, lon: 77.075 }, // Default user position nearby
  onSlotBooked,
}) => {
  const [selectedGunId, setSelectedGunId] = useState<string>(station.guns[0]?.gunId ?? '');
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const selectedGun = station.guns.find((g) => g.gunId === selectedGunId) || station.guns[0];
  const distanceKm = calculateHaversineDistanceKm(
    userCoords.lat,
    userCoords.lon,
    station.latitude,
    station.longitude
  );

  const estimate = calculateChargingSessionEstimate(
    22, // current 22% SoC
    85, // charge to 85% SoC
    60, // 60 kWh battery pack
    selectedGun?.maxOutputKw ?? 60,
    selectedGun?.tariffPerKwhPaise ?? 1850
  );

  const availableGunsCount = station.guns.filter((g) => g.status === 'AVAILABLE').length;

  const handleBookSlot = () => {
    setIsBooked(true);
    Alert.alert(
      'Charging Slot Reserved!',
      `Gun ${selectedGun.gunId} (${selectedGun.maxOutputKw} kW ${selectedGun.plugType}) reserved at ${station.name}. We will hold the slot for 15 minutes.`,
      [{ text: 'Navigate to Station' }]
    );
    if (onSlotBooked) {
      onSlotBooked(station.stationId, selectedGun.gunId);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: availableGunsCount > 0 ? '#064E3B' : '#450A0A' },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: availableGunsCount > 0 ? '#34D399' : '#F87171' },
            ]}
          >
            {availableGunsCount > 0 ? `${availableGunsCount} GUNS FREE` : 'ALL OCCUPIED'}
          </Text>
        </View>
        <Text style={styles.distanceText}>{distanceKm} km away</Text>
      </View>

      <Text style={styles.stationName}>{station.name}</Text>
      <Text style={styles.addressText}>{station.address}</Text>

      {/* Guns Selector */}
      <Text style={styles.sectionHeading}>Select Connector & Speed</Text>
      <View style={styles.gunsRow}>
        {station.guns.map((gun) => {
          const isSelected = gun.gunId === selectedGunId;
          const isAvailable = gun.status === 'AVAILABLE';
          return (
            <TouchableOpacity
              key={gun.gunId}
              style={[
                styles.gunPill,
                isSelected && styles.gunPillSelected,
                !isAvailable && styles.gunPillDisabled,
              ]}
              onPress={() => isAvailable && setSelectedGunId(gun.gunId)}
              disabled={!isAvailable}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.gunOutputText,
                  isSelected && styles.gunOutputTextSelected,
                  !isAvailable && styles.gunOutputTextDisabled,
                ]}
              >
                {gun.maxOutputKw} kW
              </Text>
              <Text
                style={[
                  styles.gunPlugText,
                  isSelected && styles.gunPlugTextSelected,
                  !isAvailable && styles.gunPlugTextDisabled,
                ]}
              >
                {gun.plugType === 'CCS2_DC_FAST'
                  ? 'CCS2 DC'
                  : gun.plugType === 'TYPE_2_AC'
                  ? 'Type 2 AC'
                  : 'Fast DC'}
              </Text>
              <Text style={styles.tariffSubtext}>₹{(gun.tariffPerKwhPaise / 100).toFixed(1)}/u</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Telemetry Session Simulation */}
      <View style={styles.telemetryBox}>
        <View style={styles.telemetryHeader}>
          <Text style={styles.telemetryTitle}>Estimated Session (22% → 85% SoC)</Text>
          <Text style={styles.rangeGainText}>+{estimate.postChargeEstimatedRangeKm} km Range</Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Time to 85%</Text>
            <Text style={styles.metricValue}>{estimate.estimatedDurationMinutes} mins</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Units (kWh)</Text>
            <Text style={styles.metricValue}>{estimate.energyNeededKwh} kWh</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Est. Total Cost</Text>
            <Text style={[styles.metricValue, { color: colors.primaryLight }]}>
              {estimate.formattedTotalCost}
            </Text>
          </View>
        </View>
      </View>

      {/* Amenities */}
      <View style={styles.amenitiesRow}>
        {station.amenities.map((item, idx) => (
          <Text key={idx} style={styles.amenityText}>
            {item}
          </Text>
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[styles.bookButton, isBooked && styles.bookButtonDone]}
        disabled={isBooked || availableGunsCount === 0}
        onPress={handleBookSlot}
        activeOpacity={0.8}
      >
        <Text style={styles.bookButtonText}>
          {isBooked
            ? '✓ 15-Min Slot Hold Confirmed'
            : availableGunsCount === 0
            ? 'No Guns Available'
            : `Reserve ${selectedGun.maxOutputKw}kW Gun • ${estimate.formattedTotalCost}`}
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
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  distanceText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent,
    fontWeight: typography.fontWeight.semibold,
  },
  stationName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  addressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  gunsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  gunPill: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  gunPillSelected: {
    backgroundColor: '#064E3B',
    borderColor: colors.primary,
  },
  gunPillDisabled: {
    opacity: 0.4,
  },
  gunOutputText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
  },
  gunOutputTextSelected: {
    color: '#34D399',
  },
  gunOutputTextDisabled: {
    color: colors.textMuted,
  },
  gunPlugText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gunPlugTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  gunPlugTextDisabled: {
    color: colors.textMuted,
  },
  tariffSubtext: {
    fontSize: 9,
    color: colors.accent,
    marginTop: 2,
  },
  telemetryBox: {
    backgroundColor: '#0B0F19',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  telemetryTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  rangeGainText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: typography.fontWeight.bold,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  amenityText: {
    fontSize: 10,
    color: colors.textSecondary,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  bookButtonDone: {
    backgroundColor: '#064E3B',
  },
  bookButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
