import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  RouteWaypoint,
  RouteEnergyForecast,
  calculateRouteEnergyConsumption,
  getSampleDelhiJaipurWaypoints,
} from '../utils/routeWaypointEngine';

interface RouteWaypointPlannerCardProps {
  onStartNavigation?: (waypoints: RouteWaypoint[]) => void;
}

export const RouteWaypointPlannerCard: React.FC<RouteWaypointPlannerCardProps> = ({
  onStartNavigation,
}) => {
  const waypoints = getSampleDelhiJaipurWaypoints();
  const [acEnabled, setAcEnabled] = useState<boolean>(true);
  const [startSoc, setStartSoc] = useState<number>(68);

  const forecast: RouteEnergyForecast = calculateRouteEnergyConsumption(
    268, // 268 km total
    550, // 550m total climb
    340, // 340m total descent
    {
      baseConsumptionWhPerKm: 165,
      ambientTemperatureC: 38, // Hot summer day
      elevationDeltaMeters: 210,
      cabinAcActive: acEnabled,
    },
    60,
    startSoc
  );

  const handleStartNav = () => {
    Alert.alert(
      'Smart Route Navigation Active',
      `Auto-stop configured at ${forecast.recommendedChargingStopName || 'Direct Route'}. Target arrival SoC: ${forecast.estimatedArrivalSocPercent}%.`,
      [{ text: 'Proceed' }]
    );
    if (onStartNavigation) onStartNavigation(waypoints);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SMART CORRIDOR NAV</Text>
        </View>
        <Text style={styles.distanceText}>{forecast.totalDistanceKm} km total</Text>
      </View>

      <Text style={styles.title}>Delhi ➔ Jaipur Super-Highway</Text>
      <Text style={styles.subtitle}>Elevation-aware power drain & regen modeling</Text>

      {/* SoC Health Preview */}
      <View style={styles.socContainer}>
        <View style={styles.socCol}>
          <Text style={styles.socLabel}>Start SoC</Text>
          <Text style={styles.socVal}>{forecast.startSocPercent}%</Text>
        </View>
        <Text style={styles.arrowIcon}>➔</Text>
        <View style={styles.socCol}>
          <Text style={styles.socLabel}>Est. Arrival</Text>
          <Text
            style={[
              styles.socVal,
              { color: forecast.isRangeAnxietyTriggered ? '#EF4444' : '#10B981' },
            ]}
          >
            {forecast.estimatedArrivalSocPercent}%
          </Text>
        </View>
        <View style={styles.socCol}>
          <Text style={styles.socLabel}>Regen Gain</Text>
          <Text style={[styles.socVal, { color: colors.primaryLight }]}>
            +{forecast.regenEnergyRecoveredKwh} kWh
          </Text>
        </View>
      </View>

      {/* Range Anxiety Alert */}
      {forecast.isRangeAnxietyTriggered && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertTextCol}>
            <Text style={styles.alertTitle}>Charging Stop Required</Text>
            <Text style={styles.alertDesc}>
              Arrival SoC is below 15% safety threshold. Recommend 18-min top-up at{' '}
              {forecast.recommendedChargingStopName}.
            </Text>
          </View>
        </View>
      )}

      {/* Waypoints List */}
      <View style={styles.waypointsList}>
        {waypoints.map((wp, idx) => (
          <View key={wp.id} style={styles.wpRow}>
            <View style={styles.wpDotCol}>
              <View
                style={[
                  styles.wpDot,
                  wp.isChargingStop ? styles.wpDotCharging : styles.wpDotRegular,
                ]}
              />
              {idx < waypoints.length - 1 && <View style={styles.wpLine} />}
            </View>
            <View style={styles.wpContent}>
              <Text style={styles.wpName}>
                {wp.name} {wp.isChargingStop && '⚡ (150kW Ultra DC)'}
              </Text>
              <Text style={styles.wpSub}>
                +{wp.distanceFromStartKm} km • Elevation: {wp.elevationMeters}m
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.navButton} onPress={handleStartNav} activeOpacity={0.8}>
        <Text style={styles.navButtonText}>Start Navigation with Auto-Waypoint</Text>
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
  distanceText: {
    fontSize: typography.fontSize.xs,
    color: colors.accent,
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
  socContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  socCol: {
    alignItems: 'center',
  },
  socLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  socVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 2,
  },
  arrowIcon: {
    fontSize: 14,
    color: colors.textMuted,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#450A0A',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  alertIcon: {
    fontSize: 16,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: '#FCA5A5',
  },
  alertDesc: {
    fontSize: 11,
    color: '#FECACA',
    marginTop: 2,
  },
  waypointsList: {
    marginBottom: spacing.md,
  },
  wpRow: {
    flexDirection: 'row',
  },
  wpDotCol: {
    alignItems: 'center',
    width: 20,
  },
  wpDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  wpDotRegular: {
    backgroundColor: colors.textMuted,
  },
  wpDotCharging: {
    backgroundColor: '#34D399',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  wpLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  wpContent: {
    flex: 1,
    paddingBottom: 12,
    paddingLeft: spacing.sm,
  },
  wpName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  wpSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  navButton: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  navButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
