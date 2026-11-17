# ⚡ VoltDrive: Smart EV Charging Station Navigator & Battery SoC Engine

<div align="center">

  <img src="https://img.shields.io/badge/Platform-React_Native_%7C_Expo-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Language-TypeScript_5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Protocol-OCPP_2.0.1_%7C_CCS2_DC-10B981?style=for-the-badge&logo=electric&logoColor=white" alt="OCPP" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />

  <p align="center">
    <strong>Production-grade Electric Vehicle (EV) smart route navigator, real-time connector telemetry, CC/CV fast-charge taper modeling, and guaranteed slot reservation architecture.</strong>
  </p>

</div>

---

## 🚀 Key Engineering Capabilities

1. **CC/CV Fast-Charging Curve Simulation:**
   Models real-world lithium-ion battery electrochemical protection: constant-current (CC) high-speed transfer up to 80% State-of-Charge (SoC), tapering down to 35% effective output for the remaining 20% to avoid dendritic thermal degradation.

2. **Haversine Geospatial Charger Proximity:**
   Computes Great-Circle driver distance across latitude/longitude coordinates to prioritize low-detour ultra-fast DC hubs ($P \ge 120\text{ kW}$).

3. **Multi-Connector Protocol Matrix:**
   - **CCS2 Combo (DC):** 60 kW – 150 kW high-throughput corridor charging.
   - **Type 2 Mennekes (AC):** 11 kW – 22 kW destination top-up.
   - **CHAdeMO / GB/T:** Legacy and fleet fleet-compatible DC fast charging.

4. **Zero-Float Integer Paise Tariffs:**
   Financial calculations use zero-float integer paise arithmetic with statutory 18% GST calculation.

---

## 📐 Mathematical Formulation

### 1. Battery Pack Energy Requirement
$$\Delta E = \frac{\text{SoC}_{\text{target}} - \text{SoC}_{\text{current}}}{100} \times C_{\text{battery}}\text{ (kWh)}$$

### 2. Charging Duration (Fast vs Taper Phase)
$$T_{\text{total}} = \left(\frac{E_{\le 80\%}}{P_{\text{charger}}} + \frac{E_{> 80\%}}{0.35 \times P_{\text{charger}}}\right) \times 60\text{ (minutes)}$$

---

## 📁 Architecture Overview

```
voltdrive-ev-charging-station-navigator/
├── src/
│   ├── components/
│   │   └── EvChargingStationCard.tsx    # Live connector cards & slot reservation
│   ├── utils/
│   │   └── evChargingEngine.ts          # SoC & CC/CV taper mathematics
│   └── theme/
│       └── index.ts                     # Cockpit dark neon design system
├── App.tsx                              # Corridor overview container
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

```bash
# Clone the repository
git clone git@github.com:trydigital2/voltdrive-ev-charging-station-navigator.git

# Install dependencies
npm install

# Run on iOS / Android Simulator
npx expo start
```

---

<div align="center">
  <sub>Engineered with precision by <strong>Trydigital</strong> · © 2026 All Rights Reserved</sub>
</div>
