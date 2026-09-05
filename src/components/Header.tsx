import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  Volume2,
  VolumeX,
  Power,
  Cpu,
  Clock,
  Sliders,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  User,
  Lock,
} from 'lucide-react';

import type {
  ConveyorTelemetry,
  SimulationScenario,
  Severity,
} from '../types/telemetry';

import { audioService } from '../services/audioAlerts';

interface HeaderProps {
  telemetry: ConveyorTelemetry;
  systemStatus: Severity;
  scenario: SimulationScenario;
  onScenarioChange: (scenario: SimulationScenario) => void;
  onTriggerEmergencyStop: () => void;
  onToggleConveyorState: () => void;
  onExportReport: () => void;
  unreadCriticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry,
  systemStatus,
  scenario,
  onScenarioChange,
  onTriggerEmergencyStop,
  onToggleConveyorState,
  onExportReport,
  unreadCriticalCount,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' AEST'
      );
    };

    updateTime();

    const interval = window.setInterval(updateTime, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const toggleMute = () => {
    const nextState = !isMuted;

    setIsMuted(nextState);
    audioService.setMuted(nextState);

    if (!nextState) {
      audioService.playClick(900, 0.05);
    }
  };

  const getStatusBadge = () => {
    if (systemStatus === 'CRITICAL') {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Critical Alert Triggered
        </span>
      );
    }

    if (systemStatus === 'WARNING') {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          Elevated Strain Warning
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        All Systems Nominal
      </span>
    );
  };

  const getScenarioLabel = () => {
    switch (scenario) {
      case 'NOMINAL_OPERATION':
        return 'Nominal Flow';

      case 'HEAVY_SHOCK_LOAD':
        return 'Heavy Load Shock';

      case 'LONGITUDINAL_RIP_ALERT':
        return 'Rip at Chute';

      case 'CRITICAL_JOINT_RUPTURE':
        return 'Splice #4 Rupture';

      case 'LORA_NODE_DEGRADATION':
        return 'LoRa Dropout';

      default:
        return 'Unknown Scenario';
    }
  };

  const handleScenarioChange = (
    nextScenario: SimulationScenario
  ) => {
    onScenarioChange(nextScenario);
    setShowScenarioMenu(false);
  };

  return (
    <header className="relative z-30 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0f172a] px-5 py-3 shadow-md">

      {/* =========================
          LEFT: BRAND
      ========================= */}
      <div className="flex items-center gap-3.5">

        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
            <svg
              viewBox="0 0 48 48"
              className="h-6 w-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="BeltGuard AI logo"
            >
              <path
                d="M8 34L18 18L25 27L32 12L40 34"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M8 37H40"
                stroke="#14b8a6"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <circle
                cx="18"
                cy="18"
                r="3"
                fill="#22d3ee"
              />

              <circle
                cx="32"
                cy="12"
                r="3"
                fill="#14b8a6"
              />
            </svg>
          </div>

          {/* Critical alert count */}
          {unreadCriticalCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border border-slate-900 bg-red-600 text-[10px] font-bold text-white">
              {unreadCriticalCount > 99
                ? '99+'
                : unreadCriticalCount}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2.5">

            <h1 className="flex items-center gap-1.5 text-base font-bold tracking-wide text-white">
              <span>BeltGuard AI</span>

              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-normal text-slate-400">
                SIH-26008
              </span>
            </h1>

            {getStatusBadge()}

            <span className="hidden items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-300 sm:flex">
              <Lock className="h-3 w-3 text-indigo-400" />
              <span>IEC 62443 SL-3</span>
            </span>
          </div>

          <p className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Pilbara Pit #4 • Overland CV-204 (4.8km)
            </span>

            <span className="text-slate-600">•</span>

            <span className="text-slate-300">
              ST-5400 Steel Cord (2200mm)
            </span>
          </p>
        </div>
      </div>

      {/* =========================
          MIDDLE: TELEMETRY
      ========================= */}
      <div className="hidden items-center gap-3 rounded-lg border border-slate-800 bg-[#090d16] px-3.5 py-1.5 text-xs text-slate-300 xl:flex">

        <div className="flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-sky-400" />

          <span className="text-slate-400">
            LoRa SX1278:
          </span>

          <span className="font-semibold text-emerald-400">
            16/16 Online
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5">
          <Cpu className="h-3.5 w-3.5 text-slate-400" />

          <span className="text-slate-400">
            Edge ML:
          </span>

          <span className="font-semibold text-slate-200">
            Isolation Forest (8.4ms)
          </span>
        </div>

        <div className="h-3 w-px bg-slate-800" />

        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-slate-400" />

          <span className="text-slate-400">
            Operator:
          </span>

          <span className="font-semibold text-slate-200">
            Rahul D. (Shift A)
          </span>
        </div>
      </div>

      {/* =========================
          RIGHT: CONTROLS
      ========================= */}
      <div className="flex items-center gap-2.5">

        {/* Clock */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-[#090d16] px-2.5 py-1.5 font-mono text-xs text-slate-300 md:flex">
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>
            {timeStr || '00:00:00 AEST'}
          </span>
        </div>

        {/* Audio */}
        <button
          type="button"
          onClick={toggleMute}
          title={
            isMuted
              ? 'Unmute Audio Alarms'
              : 'Mute Audio Alarms'
          }
          aria-label={
            isMuted
              ? 'Unmute Audio Alarms'
              : 'Mute Audio Alarms'
          }
          className={`flex items-center justify-center rounded-lg border p-2 text-xs transition-colors ${
            isMuted
              ? 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-white'
              : 'border-slate-700 bg-slate-800 text-sky-400 hover:bg-slate-700'
          }`}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        {/* Export */}
        <button
          type="button"
          onClick={onExportReport}
          title="Export Telemetry & Damage Log (CSV)"
          aria-label="Export telemetry CSV"
          className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-400" />

          <span className="hidden text-xs font-medium sm:inline">
            Export CSV
          </span>
        </button>

        {/* =========================
            SCENARIO SELECTOR
        ========================= */}
        <div className="relative">

          <button
            type="button"
            onClick={() => {
              audioService.playClick(1000);
              setShowScenarioMenu((prev) => !prev);
            }}
            aria-expanded={showScenarioMenu}
            aria-haspopup="menu"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700"
          >
            <Sliders className="h-3.5 w-3.5 text-amber-400" />

            <span className="hidden sm:inline">
              Scenario:
            </span>

            <span className="font-semibold text-amber-300">
              {getScenarioLabel()}
            </span>
          </button>

          {showScenarioMenu && (
            <div
              className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-slate-700 bg-[#0f172a] p-2 text-xs shadow-xl"
              role="menu"
            >
              <div className="mb-1 border-b border-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Simulation Scenario
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  handleScenarioChange(
                    'NOMINAL_OPERATION'
                  )
                }
                className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors hover:bg-slate-800 ${
                  scenario === 'NOMINAL_OPERATION'
                    ? 'bg-slate-800 font-bold text-emerald-300'
                    : 'text-slate-300'
                }`}
              >
                <span>
                  1. Nominal Operation (8450 TPH)
                </span>

                {scenario === 'NOMINAL_OPERATION' && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  handleScenarioChange(
                    'HEAVY_SHOCK_LOAD'
                  )
                }
                className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors hover:bg-slate-800 ${
                  scenario === 'HEAVY_SHOCK_LOAD'
                    ? 'bg-slate-800 font-bold text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                <span>
                  2. Heavy Shock Load (10.4k TPH)
                </span>

                {scenario === 'HEAVY_SHOCK_LOAD' && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  handleScenarioChange(
                    'LONGITUDINAL_RIP_ALERT'
                  )
                }
                className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors hover:bg-slate-800 ${
                  scenario === 'LONGITUDINAL_RIP_ALERT'
                    ? 'bg-slate-800 font-bold text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                <span>
                  3. Longitudinal Rip at Chute
                </span>

                {scenario ===
                  'LONGITUDINAL_RIP_ALERT' && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  handleScenarioChange(
                    'CRITICAL_JOINT_RUPTURE'
                  )
                }
                className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors hover:bg-slate-800 ${
                  scenario ===
                  'CRITICAL_JOINT_RUPTURE'
                    ? 'bg-slate-800 font-bold text-red-300'
                    : 'text-slate-300'
                }`}
              >
                <span className="font-semibold text-red-400">
                  4. Splice #4 Impending Rupture
                </span>

                {scenario ===
                  'CRITICAL_JOINT_RUPTURE' && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                )}
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  handleScenarioChange(
                    'LORA_NODE_DEGRADATION'
                  )
                }
                className={`flex w-full items-center justify-between rounded px-2.5 py-2 text-left transition-colors hover:bg-slate-800 ${
                  scenario ===
                  'LORA_NODE_DEGRADATION'
                    ? 'bg-slate-800 font-bold text-sky-300'
                    : 'text-slate-300'
                }`}
              >
                <span>
                  5. LoRa Telemetry Dropout
                </span>

                {scenario ===
                  'LORA_NODE_DEGRADATION' && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Conveyor */}
        <button
          type="button"
          onClick={onToggleConveyorState}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            telemetry.isRunning
              ? 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
              : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
          }`}
        >
          <Power
            className={`h-3.5 w-3.5 ${
              telemetry.isRunning
                ? 'text-amber-400'
                : 'text-white'
            }`}
          />

          <span>
            {telemetry.isRunning
              ? 'Pause Drive'
              : 'Start Drive'}
          </span>
        </button>

        {/* E-STOP */}
        <button
          type="button"
          onClick={() => {
            audioService.playClick(400, 0.2);
            onTriggerEmergencyStop();
          }}
          aria-label="Emergency stop conveyor"
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-500"
        >
          <span>E-STOP</span>
        </button>

        {/* Help */}
        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          title="About System Architecture"
          aria-label="About System Architecture"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>

      {/* =========================
          HELP MODAL
      ========================= */}
      {showHelpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="BeltGuard AI System Architecture"
        >
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-700 bg-[#0f172a] p-6 text-slate-200 shadow-2xl">

            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">

              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-5 w-5 text-sky-400" />

                <h2 className="text-base font-bold uppercase tracking-wide text-white">
                  BeltGuard AI System Architecture
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                aria-label="Close"
                className="px-2 text-base font-bold text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">

              <div className="rounded-lg border border-slate-800 bg-[#090d16] p-3">
                <p className="mb-1 font-bold text-sky-400">
                  Smart India Hackathon 2026 - Problem Statement SIH26008
                </p>

                <p className="text-slate-400">
                  Belt Joint Rupture and Conveyor Belt
                  Damages in Iron Ore Mining Industry:
                  Intelligent Monitoring and Prediction
                  using Multi-Sensor Fusion and Edge
                  Machine Learning.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">

                <div className="rounded border border-slate-800 bg-[#090d16] p-2.5">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-400">
                    Hardware Sensing Layer
                  </span>

                  <span className="text-slate-200">
                    ESP32 + LoRa SX1278 (868/915 MHz),
                    Strain Gauges, Tri-axial Vibration,
                    High-Speed Optical Line-Scan &
                    Acoustic/MFL Sensor.
                  </span>
                </div>

                <div className="rounded border border-slate-800 bg-[#090d16] p-2.5">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-400">
                    Edge ML & Inference
                  </span>

                  <span className="text-slate-200">
                    Isolation Forest for multivariate
                    anomaly detection, RUL
                    Weibull/Regression model,
                    Sub-10ms edge latency.
                  </span>
                </div>

                <div className="rounded border border-slate-800 bg-[#090d16] p-2.5">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-400">
                    Control Room Interlocking
                  </span>

                  <span className="text-slate-200">
                    SCADA direct relay trigger,
                    controlled deceleration ramp (15s),
                    automatic chute diverter trip &
                    SMS/GSM alerts.
                  </span>
                </div>

                <div className="rounded border border-slate-800 bg-[#090d16] p-2.5">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-400">
                    Mining Benchmark References
                  </span>

                  <span className="text-slate-200">
                    NASA Prognostics Repository,
                    CWRU Bearing Faults, IEEE
                    Multi-Sensor Mine Conveyor
                    Standards.
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] text-slate-400">
                Team IronPulse • Smart India Hackathon 2026 •
                Real-time Hardware & Software Prototype
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
              >
                Close Info
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
