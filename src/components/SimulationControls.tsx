import React from 'react';
import { 
  RotateCcw, 
  Sparkles
} from 'lucide-react';
import type { SimulationScenario, ConveyorTelemetry } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface SimulationControlsProps {
  scenario: SimulationScenario;
  telemetry: ConveyorTelemetry;
  onScenarioChange: (scenario: SimulationScenario) => void;
  onSpeedChange: (speed: number) => void;
  onTonnageChange: (tonnage: number) => void;
  onResetSystem: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  scenario,
  telemetry,
  onScenarioChange,
  onSpeedChange,
  onTonnageChange,
  onResetSystem,
}) => {
  return (
    <div className="bg-[#0f172a] border-t border-slate-800 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md relative z-20 text-xs">
      {/* Left: Quick Simulation Scenario Presets */}
      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Scenarios:</span>
        </span>

        <button
          onClick={() => {
            audioService.playClick(1000);
            onScenarioChange('NOMINAL_OPERATION');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'NOMINAL_OPERATION'
              ? 'bg-slate-700 border-slate-500 text-white font-semibold'
              : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          1. Nominal Flow
        </button>

        <button
          onClick={() => {
            audioService.playClick(1000);
            onScenarioChange('HEAVY_SHOCK_LOAD');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'HEAVY_SHOCK_LOAD'
              ? 'bg-slate-700 border-slate-500 text-amber-300 font-semibold'
              : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          2. Heavy Shock Load
        </button>

        <button
          onClick={() => {
            audioService.playClick(1000);
            onScenarioChange('LONGITUDINAL_RIP_ALERT');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'LONGITUDINAL_RIP_ALERT'
              ? 'bg-slate-700 border-slate-500 text-amber-300 font-semibold'
              : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          3. Rip at Chute
        </button>

        <button
          onClick={() => {
            audioService.playClick(400);
            onScenarioChange('CRITICAL_JOINT_RUPTURE');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'CRITICAL_JOINT_RUPTURE'
              ? 'bg-red-600/30 border-red-500 text-red-300 font-semibold'
              : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-red-400'
          }`}
        >
          4. Splice #4 Rupture Risk
        </button>

        <button
          onClick={() => {
            audioService.playClick(1000);
            onScenarioChange('LORA_NODE_DEGRADATION');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'LORA_NODE_DEGRADATION'
              ? 'bg-slate-700 border-slate-500 text-sky-300 font-semibold'
              : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          5. LoRa Dropout
        </button>

        <button
          onClick={() => {
            audioService.playCyberKlaxon();
            onScenarioChange('CYBER_MODBUS_TAMPER');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'CYBER_MODBUS_TAMPER'
              ? 'bg-purple-900/60 border-purple-500 text-purple-300 font-bold'
              : 'bg-[#090d16] border-slate-800 text-purple-400 hover:text-purple-300'
          }`}
        >
          6. Cyber: Modbus Tamper 🛡️
        </button>

        <button
          onClick={() => {
            audioService.playCyberKlaxon();
            onScenarioChange('SAFETY_RED_ZONE_BREACH');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'SAFETY_RED_ZONE_BREACH'
              ? 'bg-red-900/60 border-red-500 text-red-300 font-bold animate-pulse'
              : 'bg-[#090d16] border-slate-800 text-red-400 hover:text-red-300'
          }`}
        >
          7. Safety: Nip-Point Breach 🚨
        </button>

        <button
          onClick={() => {
            audioService.playClick(1000);
            onScenarioChange('CYBER_LORA_RF_SPOOF');
          }}
          className={`px-2.5 py-1 rounded-lg border font-medium transition-colors ${
            scenario === 'CYBER_LORA_RF_SPOOF'
              ? 'bg-purple-900/60 border-purple-500 text-purple-300 font-bold'
              : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          8. Cyber: RF Spoof
        </button>
      </div>

      {/* Right: Sliders & Reset */}
      <div className="flex items-center gap-3">
        {/* Speed Slider */}
        <div className="hidden md:flex items-center gap-2 bg-[#090d16] px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400">Speed:</span>
          <input
            type="range"
            min="0"
            max="6.0"
            step="0.1"
            value={telemetry.isRunning ? telemetry.speedMps : 0}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-18 accent-sky-400 cursor-pointer h-1.5 bg-slate-700 rounded"
          />
          <span className="text-slate-200 font-mono font-semibold w-12 text-right">
            {telemetry.isRunning ? telemetry.speedMps.toFixed(1) : '0.0'} m/s
          </span>
        </div>

        {/* Tonnage Slider */}
        <div className="hidden lg:flex items-center gap-2 bg-[#090d16] px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400">Load:</span>
          <input
            type="range"
            min="0"
            max="12000"
            step="250"
            value={telemetry.isRunning ? telemetry.tonnageTph : 0}
            onChange={(e) => onTonnageChange(parseInt(e.target.value, 10))}
            className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded"
          />
          <span className="text-slate-200 font-mono font-semibold w-16 text-right">
            {telemetry.isRunning ? telemetry.tonnageTph.toLocaleString() : 0} TPH
          </span>
        </div>

        {/* Reset System */}
        <button
          onClick={() => {
            audioService.playClick(900);
            onResetSystem();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
