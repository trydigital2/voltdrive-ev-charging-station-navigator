import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native';
import { EvChargingStationCard } from './src/components/EvChargingStationCard';
import { getSampleEvChargingStations } from './src/utils/evChargingEngine';
import { colors, spacing, typography } from './src/theme';

export default function App() {
  const stations = getSampleEvChargingStations();
  const [activeTab, setActiveTab] = useState<'MAP' | 'STATIONS'>('STATIONS');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.tag}>VOLTDRIVE EV MOBILITY</Text>
          <Text style={styles.title}>Fast Charging Corridor</Text>
          <Text style={styles.subtitle}>
            Live OCPP 2.0.1 status, CC/CV taper telemetry & guaranteed slot reservations
          </Text>
        </View>

        {stations.map((station) => (
          <EvChargingStationCard key={station.stationId} station={station} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.base,
  },
  header: {
    marginVertical: spacing.lg,
  },
  tag: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
