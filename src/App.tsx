import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Header 
} from './components/Header';
import { 
  HeroMetricsBar 
} from './components/HeroMetricsBar';
import { 
  BeltTwinContainer 
} from './components/BeltTwinContainer';
import { 
  ReplayScrubber,
  type ReplayEventBookmark
} from './components/ReplayScrubber';
import { 
  SpliceModal 
} from './components/SpliceModal';
import { 
  MLAnalyticsPanel 
} from './components/MLAnalyticsPanel';
import { 
  VisionTelemetryFeeds 
} from './components/VisionTelemetryFeeds';
import {
  SpliceMatrixTable
} from './components/SpliceMatrixTable';
import {
  OperatorShiftLog
} from './components/OperatorShiftLog';
import {
  LiveTelemetryStreamer
} from './components/LiveTelemetryStreamer';
import {
  OTSecurityCenter
} from './components/OTSecurityCenter';
import { 
  InterlockingSidebar 
} from './components/InterlockingSidebar';
import { 
  EmergencyInterlockModal 
} from './components/EmergencyInterlockModal';
import { 
  SimulationControls 
} from './components/SimulationControls';

import type {
  SpliceJoint,
  DamageMarker,
  SensorNode,
  AlertLog,
  MLMetrics,
  ConveyorTelemetry,
  SimulationScenario,
  Severity,
  PurdueZoneStatus,
  CyberThreatEvent,
  PersonnelZoneTracker,
  LotoLockRecord
} from './types/telemetry';

import {
  INITIAL_SPLICES,
  INITIAL_ANOMALIES,
  INITIAL_SENSOR_NODES,
  INITIAL_ALERTS,
  INITIAL_ML_METRICS,
  INITIAL_TELEMETRY,
  INITIAL_PURDUE_ZONES,
  INITIAL_CYBER_THREATS,
  INITIAL_PERSONNEL,
  INITIAL_LOTO_LOCKS
} from './services/telemetryEngine';

import { audioService } from './services/audioAlerts';
import { 
  Camera, 
  Activity, 
  Layers, 
  ClipboardList, 
  Terminal,
  ShieldAlert,
  CheckCircle2, 
  Info, 
  AlertTriangle 
} from 'lucide-react';

export const App: React.FC = () => {
  // Master State
  const [telemetry, setTelemetry] = useState<ConveyorTelemetry>(INITIAL_TELEMETRY);
  const [splices, setSplices] = useState<SpliceJoint[]>(INITIAL_SPLICES);
  const [anomalies] = useState<DamageMarker[]>(INITIAL_ANOMALIES);
  const [sensorNodes, setSensorNodes] = useState<SensorNode[]>(INITIAL_SENSOR_NODES);
  const [alerts, setAlerts] = useState<AlertLog[]>(INITIAL_ALERTS);
  const [mlMetrics, setMlMetrics] = useState<MLMetrics>(INITIAL_ML_METRICS);
  const [scenario, setScenario] = useState<SimulationScenario>('NOMINAL_OPERATION');

  // OT Cybersecurity & Physical Safety State
  const [purdueZones, setPurdueZones] = useState<PurdueZoneStatus[]>(INITIAL_PURDUE_ZONES);
  const [threats, setThreats] = useState<CyberThreatEvent[]>(INITIAL_CYBER_THREATS);
  const [personnel, setPersonnel] = useState<PersonnelZoneTracker[]>(INITIAL_PERSONNEL);
  const [lotoLocks, setLotoLocks] = useState<LotoLockRecord[]>(INITIAL_LOTO_LOCKS);

  // Time-Machine Replay State
  const [isReplayMode, setIsReplayMode] = useState<boolean>(false);
  const [replayOffsetMinutes, setReplayOffsetMinutes] = useState<number>(0);

  // UI Tab Navigation
  const [activeTab, setActiveTab] = useState<'VISION' | 'ANALYTICS' | 'SPLICES' | 'LOGS' | 'STREAM' | 'SECURITY'>('VISION');

  // Modal / Drawer State
  const [selectedSplice, setSelectedSplice] = useState<SpliceJoint | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'SUCCESS' | 'WARN' | 'INFO' } | null>(null);

  const decelTimerRef = useRef<number | null>(null);

  const showToast = (text: string, type: 'SUCCESS' | 'WARN' | 'INFO' = 'INFO') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Derive system status
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged);
  const warningAlerts = alerts.filter(a => a.severity === 'WARNING' && !a.acknowledged);

  const systemStatus: Severity = 
    criticalAlerts.length > 0 ? 'CRITICAL' : warningAlerts.length > 0 ? 'WARNING' : 'NOMINAL';

  // Toggle LOTO Lock Record
  const handleToggleLotoLock = (lockId: string) => {
    setLotoLocks((prev) =>
      prev.map((l) => {
        if (l.lockId === lockId) {
          const nextStatus = l.status === 'RELEASED' ? 'LOCKED' : 'RELEASED';
          showToast(`LOTO Lock ${lockId} state updated to: ${nextStatus}`, 'SUCCESS');
          return { ...l, status: nextStatus };
        }
        return l;
      })
    );
  };

  // Quarantine Cyber Threat
  const handleQuarantineThreat = (threatId: string) => {
    setThreats((prev) =>
      prev.map((t) => {
        if (t.id === threatId) {
          showToast(`Threat ${threatId} origin quarantined. Ingress traffic isolated on Level 2 switch.`, 'SUCCESS');
          return { ...t, status: 'BLOCKED' };
        }
        return t;
      })
    );
  };

  // Scenario Changer
  const handleScenarioChange = (newScenario: SimulationScenario) => {
    audioService.playScenarioTransition();
    setScenario(newScenario);

    if (newScenario === 'NOMINAL_OPERATION') {
      setTelemetry((prev) => ({
        ...prev,
        isRunning: true,
        speedMps: 4.8,
        speedRpm: 624,
        tonnageTph: 8450,
        interlockActive: false,
        interlockReason: null,
      }));
      setSplices((prev) =>
        prev.map((s) => ({
          ...s,
          degradationPercent: Math.min(25, s.degradationPercent),
          ruptureRiskPercent: Math.min(10, s.ruptureRiskPercent),
          cordPullOutMm: Math.min(3.0, s.cordPullOutMm),
          status: 'NOMINAL',
          dynamicStrainMicrostrain: 650 + Math.floor(Math.random() * 40),
        }))
      );
      setMlMetrics((prev) => ({
        ...prev,
        overallHealthScore: 95.8,
        isolationForestAnomalyScore: 0.12,
        rulHoursRemaining: 185.0,
        rulConfidenceInterval: [160.0, 210.0],
      }));
      setPersonnel(INITIAL_PERSONNEL);
      setPurdueZones(INITIAL_PURDUE_ZONES);
      setIsEmergencyModalOpen(false);
      showToast('Scenario 1: Nominal Mining Flow (8,450 TPH) Activated', 'SUCCESS');
    } else if (newScenario === 'HEAVY_SHOCK_LOAD') {
      setTelemetry((prev) => ({
        ...prev,
        isRunning: true,
        speedMps: 4.5,
        speedRpm: 590,
        tonnageTph: 10450,
      }));
      setSplices((prev) =>
        prev.map((s) => (s.id === 3 ? { ...s, dynamicStrainMicrostrain: 990, status: 'WARNING' } : s))
      );
      setMlMetrics((prev) => ({
        ...prev,
        overallHealthScore: 82.0,
        isolationForestAnomalyScore: 0.54,
        rulHoursRemaining: 74.0,
      }));
      showToast('Scenario 2: Heavy Shock Load (10.4k TPH Impact)', 'WARN');
    } else if (newScenario === 'LONGITUDINAL_RIP_ALERT') {
      setMlMetrics((prev) => ({
        ...prev,
        overallHealthScore: 78.5,
        isolationForestAnomalyScore: 0.68,
      }));
      showToast('Scenario 3: AI Vision Detected Longitudinal Rip at Chute 1', 'WARN');
    } else if (newScenario === 'CRITICAL_JOINT_RUPTURE') {
      setSplices((prev) =>
        prev.map((s) =>
          s.id === 4
            ? {
                ...s,
                degradationPercent: 88.5,
                ruptureRiskPercent: 94.2,
                cordPullOutMm: 15.6,
                status: 'CRITICAL',
                dynamicStrainMicrostrain: 1320,
              }
            : s
        )
      );
      setMlMetrics((prev) => ({
        ...prev,
        overallHealthScore: 61.2,
        isolationForestAnomalyScore: 0.94,
        rulHoursRemaining: 12.0,
        rulConfidenceInterval: [8.0, 16.0],
      }));
      audioService.speakAlert('Critical Alarm: Imminent joint rupture at Splice 4. Core cord slippage 15.6 millimeters.');
      setIsEmergencyModalOpen(true);
      showToast('Scenario 4: IMMINENT JOINT RUPTURE at Splice #4 (+15.6mm Pull-Out)', 'WARN');
    } else if (newScenario === 'LORA_NODE_DEGRADATION') {
      setSensorNodes((prev) =>
        prev.map((n) => (n.nodeId === 'ESP-07' ? { ...n, rssi: -106, packetLossPercent: 44.5, status: 'WARNING' } : n))
      );
      showToast('Scenario 5: Node ESP-07 RSSI Dropout (-106 dBm)', 'WARN');
    } else if (newScenario === 'CYBER_MODBUS_TAMPER') {
      setPurdueZones((prev) =>
        prev.map((z) => (z.level === 2 ? { ...z, status: 'ELEVATED', blockedAnomalies: z.blockedAnomalies + 1 } : z))
      );
      audioService.speakAlert('Cyber Security Alert: Modbus register write tampering detected on variable frequency drive controller. DPI firewall engaged.');
      showToast('Scenario 6: Modbus VFD Tampering Attack detected & blocked by Level 2 DPI Firewall', 'WARN');
      setActiveTab('SECURITY');
    } else if (newScenario === 'SAFETY_RED_ZONE_BREACH') {
      setPersonnel((prev) =>
        prev.map((p) =>
          p.id === 'PER-01'
            ? { ...p, inExclusionZone: true, safetyDistanceM: 0.8, currentZone: 'Zone 1: Head Pulley (EXCLUSION NIP-POINT)' }
            : p
        )
      );
      setTelemetry((prev) => ({
        ...prev,
        isRunning: false,
        speedMps: 0,
        speedRpm: 0,
        tonnageTph: 0,
        interlockActive: true,
        interlockReason: 'PERSONNEL NIP-POINT SAFETY TRIP ENGAGED',
      }));
      audioService.speakAlert('Emergency Safety Trip: Personnel detected in Zone 1 Drive Nip Point! Conveyor halted.');
      showToast('Scenario 7: Worker breached Red Exclusion Zone at Head Drive Pulley! Emergency trip engaged.', 'WARN');
      setActiveTab('SECURITY');
    } else if (newScenario === 'CYBER_LORA_RF_SPOOF') {
      setPurdueZones((prev) =>
        prev.map((z) => (z.level === 0 ? { ...z, status: 'ELEVATED', blockedAnomalies: z.blockedAnomalies + 1 } : z))
      );
      audioService.speakAlert('Advisory: Rogue RF transmission detected on 433 MHz band attempting nonce replay attack.');
      showToast('Scenario 8: Rogue LoRa RF Replay Attack detected on 433 MHz band', 'WARN');
      setActiveTab('SECURITY');
    }
  };

  // Replay timeline handler
  const handleReplayChange = (offsetMinutes: number, isLive: boolean) => {
    setReplayOffsetMinutes(offsetMinutes);
    setIsReplayMode(!isLive);

    if (isLive) {
      showToast('Returned to Live Real-time Telemetry', 'SUCCESS');
      return;
    }

    // Historical rewind state adjustment
    if (offsetMinutes >= 20 && offsetMinutes <= 35) {
      // Near Splice #4 rupture incident
      setSplices((prev) =>
        prev.map((s) =>
          s.id === 4
            ? { ...s, cordPullOutMm: 14.8, ruptureRiskPercent: 92.1, status: 'CRITICAL', dynamicStrainMicrostrain: 1280 }
            : s
        )
      );
      setMlMetrics((prev) => ({ ...prev, overallHealthScore: 71.4, isolationForestAnomalyScore: 0.88 }));
    } else if (offsetMinutes >= 60 && offsetMinutes <= 80) {
      // Near Chute rip incident
      setSplices((prev) =>
        prev.map((s) =>
          s.id === 4
            ? { ...s, cordPullOutMm: 6.2, ruptureRiskPercent: 28.0, status: 'NOMINAL', dynamicStrainMicrostrain: 720 }
            : s
        )
      );
      setMlMetrics((prev) => ({ ...prev, overallHealthScore: 84.0, isolationForestAnomalyScore: 0.42 }));
    } else if (offsetMinutes > 90) {
      // Earlier calm state
      setSplices((prev) =>
        prev.map((s) => ({
          ...s,
          cordPullOutMm: Math.min(2.5, s.cordPullOutMm),
          ruptureRiskPercent: 5.0,
          status: 'NOMINAL',
          dynamicStrainMicrostrain: 650,
        }))
      );
      setMlMetrics((prev) => ({ ...prev, overallHealthScore: 96.0, isolationForestAnomalyScore: 0.08 }));
    }
  };

  const handleBookmarkSelect = (bm: ReplayEventBookmark) => {
    showToast(`Replaying Incident: ${bm.title} (${bm.timeLabel})`, bm.type === 'CRITICAL' ? 'WARN' : 'INFO');
  };

  // Real-time ticking telemetry generator
  useEffect(() => {
    if (isReplayMode) return; // Freeze live increments during historical replay

    const interval = setInterval(() => {
      setTelemetry((prev) => {
        if (!prev.isRunning) return prev;
        const deltaTonnage = (Math.random() - 0.5) * 60;
        const newTonnage = Math.max(0, Math.min(12000, Math.round(prev.tonnageTph + deltaTonnage)));
        return {
          ...prev,
          tonnageTph: newTonnage,
        };
      });

      setMlMetrics((prev) => {
        const lastSeries = [...prev.historicalStrainSeries];
        if (lastSeries.length > 0) {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const currentSplice4 = splices.find(s => s.id === 4);
          const baseStrain = currentSplice4?.dynamicStrainMicrostrain || 650;
          const liveVal = Math.round(baseStrain + (Math.random() - 0.5) * 30);

          lastSeries.shift();
          lastSeries.push({
            time: timeStr,
            actual: liveVal,
            upperEnvelope: 1150,
            baseline: 650,
          });
        }
        return {
          ...prev,
          historicalStrainSeries: lastSeries,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [splices, isReplayMode]);

  // Controlled Deceleration Handler
  const handleControlledDecel = () => {
    if (decelTimerRef.current) clearInterval(decelTimerRef.current);
    showToast('Executing Controlled Deceleration Ramp (15s soft brake)...', 'WARN');

    setTelemetry((prev) => ({
      ...prev,
      decelerationRampActive: true,
      interlockReason: 'Controlled Deceleration Active - Hazard Mitigation',
    }));

    let step = 15;
    const initialSpeed = telemetry.speedMps;

    decelTimerRef.current = window.setInterval(() => {
      step -= 1;
      if (step <= 0) {
        if (decelTimerRef.current) clearInterval(decelTimerRef.current);
        setTelemetry((prev) => ({
          ...prev,
          isRunning: false,
          speedMps: 0,
          speedRpm: 0,
          tonnageTph: 0,
          decelerationRampActive: false,
          interlockActive: true,
        }));
        showToast('Controlled Deceleration Complete. Conveyor Halted.', 'SUCCESS');
      } else {
        setTelemetry((prev) => ({
          ...prev,
          speedMps: Number(((initialSpeed * step) / 15).toFixed(1)),
          speedRpm: Math.round((624 * step) / 15),
          tonnageTph: Math.round((prev.tonnageTph * step) / 15),
        }));
      }
    }, 1000);
  };

  // Hard Emergency Stop
  const handleEmergencyStop = () => {
    if (decelTimerRef.current) clearInterval(decelTimerRef.current);
    setTelemetry((prev) => ({
      ...prev,
      isRunning: false,
      speedMps: 0,
      speedRpm: 0,
      tonnageTph: 0,
      interlockActive: true,
      interlockReason: 'EMERGENCY HARD INTERLOCK ENGAGED',
      decelerationRampActive: false,
    }));
    setIsEmergencyModalOpen(false);
    showToast('EMERGENCY HARD INTERLOCK ENGAGED. DISC BRAKES LOCKED.', 'WARN');
  };

  // Toggle Conveyor Run / Stop
  const handleToggleConveyor = () => {
    setTelemetry((prev) => {
      const nextRunning = !prev.isRunning;
      showToast(nextRunning ? 'Conveyor Started (4.8 m/s)' : 'Conveyor Paused', nextRunning ? 'SUCCESS' : 'INFO');
      return {
        ...prev,
        isRunning: nextRunning,
        speedMps: nextRunning ? 4.8 : 0,
        speedRpm: nextRunning ? 624 : 0,
        tonnageTph: nextRunning ? 8450 : 0,
        interlockActive: false,
        interlockReason: null,
      };
    });
  };

  // Dispatch SAP PM Work Order
  const handleDispatchWorkOrder = (splice?: SpliceJoint) => {
    audioService.playSuccessChime();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#10b981', '#f59e0b', '#ec4899'],
    });
    const target = splice ? splice.label : 'Splice #4 Joint';
    showToast(`SAP PM Work Order #WO-${Math.floor(10000 + Math.random() * 90000)} dispatched to Maintenance Crew Alpha for ${target}.`, 'SUCCESS');
  };

  // Acknowledge single alert
  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true, actionTaken: 'Acknowledged by Operator' } : a))
    );
    showToast(`Alert ${alertId} acknowledged.`, 'INFO');
  };

  // Export Telemetry / Damage Report CSV
  const handleExportReport = () => {
    audioService.playSuccessChime();
    const headers = ['Timestamp', 'Conveyor', 'Splice_ID', 'Rupture_Risk_%', 'Cord_PullOut_mm', 'Strain_uE', 'Status'];
    const rows = splices.map((s) => [
      new Date().toISOString(),
      'CV-204_Pilbara_Sector_B',
      `SP_${s.id}`,
      `${s.ruptureRiskPercent}%`,
      `+${s.cordPullOutMm}mm`,
      `${s.dynamicStrainMicrostrain}uE`,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BeltGuard_AI_Telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Inspection Log CSV exported successfully.', 'SUCCESS');
  };

  // Reset System to Nominal
  const handleResetSystem = () => {
    audioService.playSuccessChime();
    setTelemetry(INITIAL_TELEMETRY);
    setSplices(INITIAL_SPLICES);
    setSensorNodes(INITIAL_SENSOR_NODES);
    setAlerts(INITIAL_ALERTS);
    setMlMetrics(INITIAL_ML_METRICS);
    setPurdueZones(INITIAL_PURDUE_ZONES);
    setThreats(INITIAL_CYBER_THREATS);
    setPersonnel(INITIAL_PERSONNEL);
    setLotoLocks(INITIAL_LOTO_LOCKS);
    setScenario('NOMINAL_OPERATION');
    setIsReplayMode(false);
    setReplayOffsetMinutes(0);
    setIsEmergencyModalOpen(false);
    showToast('System telemetry, Purdue zones, and ML weights reset to baseline.', 'SUCCESS');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      {/* 1. Header with SCADA status & E-STOP */}
      <Header
        telemetry={telemetry}
        systemStatus={systemStatus}
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
        onTriggerEmergencyStop={handleEmergencyStop}
        onToggleConveyorState={handleToggleConveyor}
        onExportReport={handleExportReport}
        unreadCriticalCount={criticalAlerts.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto space-y-4 pb-4">
        {/* Component 1: Hero Metrics Bar (KPIs) */}
        <HeroMetricsBar
          telemetry={telemetry}
          mlMetrics={mlMetrics}
          criticalAlertCount={criticalAlerts.length}
          warningAlertCount={warningAlerts.length}
          onOpenAlerts={() => setIsSidebarOpen(true)}
        />

        {/* Component 2: Time-Machine Replay Scrubber */}
        <div className="px-5">
          <ReplayScrubber
            isReplayMode={isReplayMode}
            replayOffsetMinutes={replayOffsetMinutes}
            onReplayChange={handleReplayChange}
            onBookmarkSelect={handleBookmarkSelect}
          />
        </div>

        {/* Component 3: Center Stage Conveyor Physical Twin Container (3D / 2D / Split) */}
        <div className="px-5">
          <BeltTwinContainer
            splices={splices}
            anomalies={anomalies}
            telemetry={telemetry}
            selectedSplice={selectedSplice}
            onSelectSplice={(splice) => setSelectedSplice(splice)}
            onSelectAnomaly={(anomaly) => {
              const matchedSplice = splices.find(s => Math.abs(s.locationMeter - anomaly.locationMeter) < 150);
              if (matchedSplice) {
                setSelectedSplice(matchedSplice);
              }
              showToast(`Inspecting ${anomaly.label} at ${anomaly.locationMeter}m`, 'INFO');
            }}
          />
        </div>

        {/* Decluttered Tabbed Navigation for Workspace Views */}
        <div className="px-5">
          <div className="flex items-center flex-wrap gap-2 border-b border-slate-800 pb-2 text-xs font-medium">
            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setActiveTab('VISION');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'VISION'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera className="w-4 h-4 text-sky-400" />
              <span>Live Visual Inspection</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setActiveTab('ANALYTICS');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'ANALYTICS'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Predictive ML & Physics Twin</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setActiveTab('SECURITY');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'SECURITY'
                  ? 'bg-gradient-to-r from-indigo-900/80 to-purple-900/80 text-white font-semibold border border-indigo-500/50 shadow-md'
                  : 'text-slate-400 hover:text-indigo-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>OT Cybersecurity & Safety</span>
              {threats.filter(t => t.status !== 'BLOCKED').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setActiveTab('SPLICES');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'SPLICES'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Splice Matrix (#1 – #8)</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setActiveTab('STREAM');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'STREAM'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Live SCADA Streamer</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setActiveTab('LOGS');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors ${
                activeTab === 'LOGS'
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4 text-amber-400" />
              <span>Shift Log & Handover</span>
            </button>
          </div>

          {/* Active View Container */}
          <div className="mt-3">
            {activeTab === 'VISION' && (
              <VisionTelemetryFeeds
                nodes={sensorNodes}
                telemetry={telemetry}
              />
            )}

            {activeTab === 'ANALYTICS' && (
              <MLAnalyticsPanel
                mlMetrics={mlMetrics}
                selectedSpliceId={selectedSplice ? selectedSplice.id : 4}
              />
            )}

            {activeTab === 'SECURITY' && (
              <OTSecurityCenter
                purdueZones={purdueZones}
                threats={threats}
                personnel={personnel}
                lotoLocks={lotoLocks}
                onToggleLotoLock={handleToggleLotoLock}
                onQuarantineThreat={handleQuarantineThreat}
              />
            )}

            {activeTab === 'SPLICES' && (
              <SpliceMatrixTable
                splices={splices}
                onSelectSplice={(splice) => setSelectedSplice(splice)}
              />
            )}

            {activeTab === 'STREAM' && (
              <LiveTelemetryStreamer
                isRunning={telemetry.isRunning}
              />
            )}

            {activeTab === 'LOGS' && (
              <OperatorShiftLog
                onDispatchQuickWorkOrder={(title) => {
                  audioService.playSuccessChime();
                  showToast(`SAP PM Work Order created: ${title}`, 'SUCCESS');
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Component 5: Bottom Simulation Toolbar */}
      <SimulationControls
        scenario={scenario}
        telemetry={telemetry}
        onScenarioChange={handleScenarioChange}
        onSpeedChange={(speed) => setTelemetry((prev) => ({ ...prev, speedMps: speed, isRunning: speed > 0 }))}
        onTonnageChange={(tonnage) => setTelemetry((prev) => ({ ...prev, tonnageTph: tonnage }))}
        onResetSystem={handleResetSystem}
      />

      {/* Splice Joint Inspection Modal */}
      <SpliceModal
        splice={selectedSplice}
        onClose={() => setSelectedSplice(null)}
        onDispatchWorkOrder={(splice) => {
          handleDispatchWorkOrder(splice);
          setSelectedSplice(null);
        }}
      />

      {/* Interlocking Sidebar Drawer */}
      <InterlockingSidebar
        alerts={alerts}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onTriggerControlledDecel={handleControlledDecel}
        onTriggerEmergencyStop={handleEmergencyStop}
        onSelectAlertSplice={(spliceId) => {
          const sp = splices.find(s => s.id === spliceId);
          if (sp) {
            setSelectedSplice(sp);
            setIsSidebarOpen(false);
          }
        }}
      />

      {/* Emergency Joint Rupture Interlock Modal */}
      <EmergencyInterlockModal
        isOpen={isEmergencyModalOpen}
        splice={splices.find(s => s.id === 4) || null}
        telemetry={telemetry}
        onClose={() => setIsEmergencyModalOpen(false)}
        onControlledDecel={handleControlledDecel}
        onHardStop={handleEmergencyStop}
        onDispatchWorkOrder={() => {
          handleDispatchWorkOrder(splices.find(s => s.id === 4));
          setIsEmergencyModalOpen(false);
        }}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-16 right-6 z-50 animate-bounce-short">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-2xl text-xs font-medium backdrop-blur-md ${
            toastMessage.type === 'SUCCESS'
              ? 'bg-[#0f172a]/95 border-emerald-500/80 text-emerald-300 shadow-emerald-500/10'
              : toastMessage.type === 'WARN'
                ? 'bg-[#0f172a]/95 border-amber-500/80 text-amber-300 shadow-amber-500/10'
                : 'bg-[#0f172a]/95 border-slate-700 text-slate-200'
          }`}>
            {toastMessage.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : toastMessage.type === 'WARN' ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Info className="w-4 h-4 text-sky-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
