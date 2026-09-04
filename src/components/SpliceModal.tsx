import React from 'react';
import { 
  X, 
  Activity, 
  Wrench, 
  Layers
} from 'lucide-react';
import type { SpliceJoint } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface SpliceModalProps {
  splice: SpliceJoint | null;
  onClose: () => void;
  onDispatchWorkOrder: (splice: SpliceJoint) => void;
}

export const SpliceModal: React.FC<SpliceModalProps> = ({
  splice,
  onClose,
  onDispatchWorkOrder,
}) => {
  if (!splice) return null;

  const isCritical = splice.status === 'CRITICAL';
  const isWarning = splice.status === 'WARNING';

  // 28 Steel Cords Cross-Section
  const cordCount = 28;
  const cords = Array.from({ length: cordCount }, (_, i) => {
    const isDefective = splice.id === 4 && i >= 11 && i <= 17;
    const isMinorFray = splice.id === 6 && (i === 4 || i === 24);
    return {
      index: i + 1,
      isDefective,
      isMinorFray,
      offsetY: isDefective ? Math.sin(i * 0.8) * 6 + 4 : 0,
    };
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-[#0f172a] border rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
        isCritical ? 'border-red-500/80' : isWarning ? 'border-amber-500/80' : 'border-slate-700'
      }`}>
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-800 bg-[#090d16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {splice.label}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  isCritical 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                    : isWarning 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {splice.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Chainage: {splice.locationMeter}m • {splice.type}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playClick(800);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-slate-300 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Rupture Probability
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${splice.ruptureRiskPercent > 60 ? 'text-red-400' : 'text-slate-100'}`}>
                {splice.ruptureRiskPercent}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Weibull P95</span>
            </div>

            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Cord Pull-Out
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${splice.cordPullOutMm > splice.maxAllowedPullOutMm ? 'text-red-400' : 'text-slate-100'}`}>
                +{splice.cordPullOutMm}mm
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Limit: {splice.maxAllowedPullOutMm}mm</span>
            </div>

            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Dynamic Strain
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${splice.dynamicStrainMicrostrain > splice.strainThreshold ? 'text-red-400' : 'text-slate-100'}`}>
                {splice.dynamicStrainMicrostrain} µε
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Ceiling: {splice.strainThreshold} µε</span>
            </div>

            <div className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Core Temperature
              </span>
              <div className={`text-xl font-bold font-mono mt-1 ${splice.temperatureC > 50 ? 'text-amber-400' : 'text-slate-100'}`}>
                {splice.temperatureC.toFixed(1)}°C
              </div>
              <span className="text-[10px] text-slate-500 font-mono">IR Telemetry</span>
            </div>
          </div>

          {/* Ultrasonic Subsurface Cord Cross-Section */}
          <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200 text-xs">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>Subsurface Magnetic Flux / Ultrasonic Scan (28 Steel Cords)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                0.1mm Resolution
              </span>
            </div>

            {/* Visualizer Frame */}
            <div className="h-20 bg-[#0c1220] border border-slate-700/80 rounded-lg p-2 relative flex items-center justify-between overflow-hidden">
              <div className="flex items-center justify-between w-full px-1">
                {cords.map((cord) => (
                  <div 
                    key={`cord-${cord.index}`} 
                    className="flex flex-col items-center group relative"
                    style={{ transform: `translateY(${cord.offsetY}px)` }}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full border transition-all flex items-center justify-center ${
                        cord.isDefective 
                          ? 'bg-red-500 border-red-300 shadow-sm shadow-red-500/50' 
                          : cord.isMinorFray 
                            ? 'bg-amber-400 border-amber-200' 
                            : 'bg-slate-400 border-slate-300'
                      }`}
                    >
                      <span className="text-[6px] font-bold text-slate-950">{cord.index}</span>
                    </div>

                    <div className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 w-28 p-1 bg-black/90 border border-slate-700 rounded text-[9px] font-mono text-white z-50 text-center">
                      Cord #{cord.index}: {cord.isDefective ? 'DISPLACED (+14mm)' : 'Nominal'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 px-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Nominal Steel Cord</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Core Attenuation</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-400 font-semibold">Cord Displacement / Pull-out</span>
              </span>
            </div>
          </div>

          {/* AI Inspection Recommendation */}
          <div className="p-3.5 bg-[#090d16] border border-slate-800 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-slate-200 block">
              Reliability & Maintenance Diagnosis
            </span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {splice.anomalyNotes}
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
              <span>Installed: {splice.installedDate}</span>
              <span>Last Synced: {splice.lastInspected}</span>
              <span className="text-emerald-400 font-semibold">ML Confidence: {(splice.confidenceScore * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-5 border-t border-slate-800 bg-[#090d16] flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            ID: SP-0{splice.id}-ST5400
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audioService.playClick(900);
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                audioService.playClick(1300);
                onDispatchWorkOrder(splice);
              }}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Dispatch SAP Work Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
