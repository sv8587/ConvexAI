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
  Lock
} from 'lucide-react';
import type { ConveyorTelemetry, SimulationScenario, Severity } from '../types/telemetry';
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
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' AEST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
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
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-400 font-bold text-xs">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Critical Alert Triggered
        </span>
      );
    }
    if (systemStatus === 'WARNING') {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 font-semibold text-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Elevated Strain Warning
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        All Systems Nominal
      </span>
    );
  };

  return (
    <header className="bg-[#0f172a] border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md relative z-30">
      {/* Left: Brand & Telemetry Mesh Identity */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="relative">
  <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
    <svg
      viewBox="0 0 48 48"
      className="w-6 h-6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Conveyor / mountain-inspired CONVEX mark */}
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

  {unreadCriticalCount > 0 && (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border border-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
      {unreadCriticalCount}
    </span>
  )}
</div>
          {unreadCriticalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border border-slate-900 text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCriticalCount}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>BeltGuard AI</span>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono font-normal">
                SIH-26008
              </span>
            </h1>
            {getStatusBadge()}
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-[10px]">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>IEC 62443 SL-3</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>Pilbara Pit #4 • Overland CV-204 (4.8km)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">ST-5400 Steel Cord (2200mm)</span>
          </p>
        </div>
      </div>

      {/* Middle: Mesh & Edge Telemetry Status */}
      <div className="hidden xl:flex items-center gap-3 bg-[#090d16] border border-slate-800 rounded-lg px-3.5 py-1.5 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-400">LoRa SX1278:</span>
          <span className="font-semibold text-emerald-400">16/16 Online</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Edge ML:</span>
          <span className="font-semibold text-slate-200">Isolation Forest (8.4ms)</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Operator:</span>
          <span className="font-semibold text-slate-200">Rahul D. (Shift A)</span>
        </div>
      </div>

      {/* Right: Controls, Simulator Switcher, Operator Info & E-STOP */}
      <div className="flex items-center gap-2.5">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#090d16] border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{timeStr || '22:08:14 AEST'}</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
          className={`p-2 rounded-lg border transition-colors text-xs flex items-center justify-center ${
            isMuted 
              ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white' 
              : 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-700'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Export Report */}
        <button
          onClick={onExportReport}
          title="Export Telemetry & Damage Log (CSV)"
          className="p-2 rounded-lg border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline text-xs font-medium">Export CSV</span>
        </button>

        {/* Scenario Simulator Selector */}
        <div className="relative">
          <button
            onClick={() => {
              audioService.playClick(1000);
              setShowScenarioMenu(!showScenarioMenu);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Scenario:</span>
            <span className="font-semibold text-amber-300">
              {scenario === 'NOMINAL_OPERATION' && 'Nominal Flow'}
              {scenario === 'HEAVY_SHOCK_LOAD' && 'Heavy Load Shock'}
              {scenario === 'LONGITUDINAL_RIP_ALERT' && 'Rip at Chute'}
              {scenario === 'CRITICAL_JOINT_RUPTURE' && 'Splice #4 Rupture'}
              {scenario === 'LORA_NODE_DEGRADATION' && 'LoRa Dropout'}
            </span>
          </button>

          {showScenarioMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl p-2 z-50 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 tracking-wider border-b border-slate-800 mb-1">
                Select Simulation Scenario
              </div>
              <button
                onClick={() => {
                  onScenarioChange('NOMINAL_OPERATION');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  scenario === 'NOMINAL_OPERATION' ? 'bg-slate-800 text-emerald-300 font-bold' : 'text-slate-300'
                }`}
              >
                <span>1. Nominal Operation (8450 TPH)</span>
                {scenario === 'NOMINAL_OPERATION' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  onScenarioChange('HEAVY_SHOCK_LOAD');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  scenario === 'HEAVY_SHOCK_LOAD' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-300'
                }`}
              >
                <span>2. Heavy Shock Load (10.4k TPH)</span>
                {scenario === 'HEAVY_SHOCK_LOAD' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  onScenarioChange('LONGITUDINAL_RIP_ALERT');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  scenario === 'LONGITUDINAL_RIP_ALERT' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-300'
                }`}
              >
                <span>3. Longitudinal Rip at Chute</span>
                {scenario === 'LONGITUDINAL_RIP_ALERT' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  onScenarioChange('CRITICAL_JOINT_RUPTURE');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  scenario === 'CRITICAL_JOINT_RUPTURE' ? 'bg-slate-800 text-red-300 font-bold' : 'text-slate-300'
                }`}
              >
                <span className="text-red-400 font-semibold">4. Splice #4 Impending Rupture</span>
                {scenario === 'CRITICAL_JOINT_RUPTURE' && <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />}
              </button>

              <button
                onClick={() => {
                  onScenarioChange('LORA_NODE_DEGRADATION');
                  setShowScenarioMenu(false);
                }}
                className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between hover:bg-slate-800 transition-colors ${
                  scenario === 'LORA_NODE_DEGRADATION' ? 'bg-slate-800 text-sky-300 font-bold' : 'text-slate-300'
                }`}
              >
                <span>5. LoRa Telemetry Dropout</span>
                {scenario === 'LORA_NODE_DEGRADATION' && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            </div>
          )}
        </div>

        {/* Conveyor Run/Pause Toggle */}
        <button
          onClick={onToggleConveyorState}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
            telemetry.isRunning
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
          }`}
        >
          <Power className={`w-3.5 h-3.5 ${telemetry.isRunning ? 'text-amber-400' : 'text-white'}`} />
          <span>{telemetry.isRunning ? 'Pause Drive' : 'Start Drive'}</span>
        </button>

        {/* E-STOP Emergency Hard Interlock Button */}
        <button
          onClick={() => {
            audioService.playClick(400, 0.2);
            onTriggerEmergencyStop();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <span>E-STOP</span>
        </button>

        {/* Help / System info button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="About System Architecture"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Info / About Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wide">
                  BeltGuard AI System Architecture
                </h2>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="bg-[#090d16] p-3 rounded-lg border border-slate-800">
                <p className="font-bold text-sky-400 mb-1">Smart India Hackathon 2026 - Problem Statement SIH26008</p>
                <p className="text-slate-400">
                  Belt Joint Rupture and Conveyor Belt Damages in Iron Ore Mining Industry: Intelligent Monitoring and Prediction using Multi-Sensor Fusion and Edge Machine Learning.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#090d16] p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold block text-[11px]">Hardware Sensing Layer</span>
                  <span className="text-slate-200">ESP32 + LoRa SX1278 (868/915 MHz), Strain Gauges, Tri-axial Vibration, High-Speed Optical Line-Scan & Acoustic/MFL Sensor.</span>
                </div>
                <div className="bg-[#090d16] p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold block text-[11px]">Edge ML & Inference</span>
                  <span className="text-slate-200">Isolation Forest for multivariate anomaly detection, RUL Weibull/Regression model, Sub-10ms edge latency.</span>
                </div>
                <div className="bg-[#090d16] p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold block text-[11px]">Control Room Interlocking</span>
                  <span className="text-slate-200">SCADA direct relay trigger, controlled deceleration ramp (15s), automatic chute diverter trip & SMS/GSM alerts.</span>
                </div>
                <div className="bg-[#090d16] p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 font-semibold block text-[11px]">Mining Benchmark References</span>
                  <span className="text-slate-200">NASA Prognostics Repository, CWRU Bearing Faults, IEEE Multi-Sensor Mine Conveyor Standards.</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-2">
                Team IronPulse • Smart India Hackathon 2026 • Real-time Hardware & Software Prototype
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors"
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
