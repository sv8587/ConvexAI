export type Severity = 'NOMINAL' | 'ADVISORY' | 'WARNING' | 'CRITICAL';

export type AlertCategory = 'CYBER_SECURITY' | 'PHYSICAL_SAFETY' | 'MECHANICAL' | 'SENSOR_RF';

export type ISAPriority = 'P1_EMERGENCY' | 'P2_URGENT' | 'P3_HIGH' | 'P4_DIAGNOSTIC';

export type DamageType = 
  | 'JOINT_SPLICE_DEGRADATION'
  | 'STEEL_CORD_PULL_OUT'
  | 'LONGITUDINAL_TEAR'
  | 'SURFACE_GOUGE'
  | 'EDGE_FRAY_DELAMINATION'
  | 'FOREIGN_METALLIC_OBJECT'
  | 'BEARING_OVERHEAT'
  | 'CYBER_MODBUS_TAMPER'
  | 'CYBER_LORA_RF_SPOOF'
  | 'CYBER_EDGE_MODEL_POISONING'
  | 'PERIMETER_RED_ZONE_BREACH'
  | 'LOTO_TAMPER_UNAUTHORIZED_OVERRIDE'
  | 'CONVEYOR_NIP_POINT_PERSONNEL_HAZARD';

export interface SpliceJoint {
  id: number;
  label: string;
  type: string; // e.g. "Steel Cord ST-5400 Step Splice"
  locationMeter: number;
  degradationPercent: number; // 0-100%
  ruptureRiskPercent: number; // 0-100%
  status: Severity;
  dynamicStrainMicrostrain: number; // e.g. 840 uE
  strainThreshold: number; // e.g. 1100 uE
  cordPullOutMm: number; // e.g. +3.2 mm
  maxAllowedPullOutMm: number; // e.g. 12.0 mm
  temperatureC: number;
  installedDate: string;
  lastInspected: string;
  confidenceScore: number;
  anomalyNotes: string;
}

export interface DamageMarker {
  id: string;
  type: DamageType;
  label: string;
  locationMeter: number;
  severity: Severity;
  confidence: number; // 0.0 - 1.0
  detectedAt: string;
  zone: string; // e.g. "Chute Impact Zone #1", "Return Strand"
  depthMm?: number;
  lengthMm?: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface SensorNode {
  nodeId: string;
  name: string;
  location: string;
  type: 'LoRa_SX1278' | 'HighSpeed_Vision' | 'Ultrasonic_MFL' | 'Strain_Gauge_Array';
  status: 'ONLINE' | 'WARNING' | 'OFFLINE';
  batteryVoltage: number; // e.g. 3.82 V
  batteryPercent: number;
  rssi: number; // e.g. -68 dBm
  snr: number; // e.g. 9.5 dB
  packetLossPercent: number;
  temperature: number;
  vibrationRms: number; // mm/s
  frequencyPeakHz: number;
  lastTelemetryTime: string;
}

export interface IncidentPlaybookStep {
  step: number;
  title: string;
  actionType: 'AUTO' | 'MANUAL' | 'VERIFY';
  completed: boolean;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  severity: Severity;
  category: AlertCategory;
  priority: ISAPriority;
  damageType: DamageType;
  title: string;
  description: string;
  locationMeter: number;
  spliceId?: number;
  sensorId: string;
  acknowledged: boolean;
  requiresInterlock: boolean;
  responseSlaSeconds?: number;
  playbookSteps?: IncidentPlaybookStep[];
  actionTaken?: string;
}

export interface MLMetrics {
  isolationForestAnomalyScore: number; // 0.0 - 1.0 (e.g. 0.12 normal, 0.88 critical)
  rulHoursRemaining: number; // Remaining Useful Life in hours
  rulConfidenceInterval: [number, number]; // [min, max]
  falsePositiveRejectionRate: number; // 99.4%
  modelInferenceLatencyMs: number; // 8.4 ms
  modelVersion: string;
  overallHealthScore: number; // 0 - 100%
  historicalStrainSeries: { time: string; actual: number; upperEnvelope: number; baseline: number }[];
  vibrationTrendSeries: { time: string; driveMotor: number; headPulley: number; tailPulley: number }[];
  damageDistribution: {
    longitudinalTears: number;
    surfaceGouges: number;
    spliceSlippage: number;
    edgeWear: number;
    foreignObjects: number;
  };
}

export interface ConveyorTelemetry {
  isRunning: boolean;
  speedMps: number; // m/s (e.g. 4.8)
  speedRpm: number;
  tonnageTph: number; // Tonnes Per Hour (e.g. 8500)
  totalBeltLengthMeters: number; // 4800m
  headDrivePowerKw: number;
  tailTensionKn: number;
  ambientTempC: number;
  shiftOperator: string;
  activeSector: string;
  interlockActive: boolean;
  interlockReason: string | null;
  decelerationRampActive: boolean;
}

export interface PurdueZoneStatus {
  level: number;
  name: string;
  description: string;
  status: 'SECURE' | 'ELEVATED' | 'COMPROMISED';
  activeFirewallRules: number;
  inspectedPackets: number;
  blockedAnomalies: number;
}

export interface CyberThreatEvent {
  id: string;
  timestamp: string;
  threatType: 'MODBUS_INJECTION' | 'LORA_REPLAY' | 'MODEL_POISONING' | 'MITM_PROBE';
  sourceIpOrMac: string;
  targetDevice: string;
  status: 'BLOCKED' | 'QUARANTINED' | 'MONITORING';
  severity: Severity;
  details: string;
}

export interface PersonnelZoneTracker {
  id: string;
  name: string;
  rfidTag: string;
  role: string;
  currentZone: string;
  inExclusionZone: boolean;
  lotoAuthorized: boolean;
  safetyDistanceM: number;
}

export interface LotoLockRecord {
  lockId: string;
  pointName: string;
  appliedBy: string;
  timestamp: string;
  status: 'LOCKED' | 'VERIFIED_ZERO_ENERGY' | 'RELEASED';
  keyHash: string;
}

export type SimulationScenario = 
  | 'NOMINAL_OPERATION'
  | 'HEAVY_SHOCK_LOAD'
  | 'LONGITUDINAL_RIP_ALERT'
  | 'CRITICAL_JOINT_RUPTURE'
  | 'LORA_NODE_DEGRADATION'
  | 'CYBER_MODBUS_TAMPER'
  | 'SAFETY_RED_ZONE_BREACH'
  | 'CYBER_LORA_RF_SPOOF';
