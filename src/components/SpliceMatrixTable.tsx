import React from 'react';
import { 
  Layers, 
  ChevronRight
} from 'lucide-react';
import type { SpliceJoint } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface SpliceMatrixTableProps {
  splices: SpliceJoint[];
  onSelectSplice: (splice: SpliceJoint) => void;
}

export const SpliceMatrixTable: React.FC<SpliceMatrixTableProps> = ({
  splices,
  onSelectSplice,
}) => {
  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Vulcanized Steel-Cord Splice Matrix</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                8 Splices Monitored
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Core steel cord displacement, dynamic microstrain, vulcanization degradation, and failure risk assessment.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 8 Splices */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {splices.map((splice) => {
          const isCritical = splice.status === 'CRITICAL';
          const isWarning = splice.status === 'WARNING';
          const isAdvisory = splice.status === 'ADVISORY';

          return (
            <div
              key={splice.id}
              onClick={() => {
                audioService.playClick(950, 0.04);
                onSelectSplice(splice);
              }}
              className={`p-3.5 rounded-xl border bg-[#090d16] hover:bg-[#111a2e] cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isCritical 
                  ? 'border-red-500/80 shadow-md shadow-red-500/10' 
                  : isWarning 
                    ? 'border-amber-500/60' 
                    : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-white font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{
                      backgroundColor: isCritical ? '#ef4444' : isWarning ? '#f59e0b' : isAdvisory ? '#eab308' : '#10b981'
                    }} />
                    <span>Joint Splice #{splice.id}</span>
                  </span>

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

                <div className="text-[11px] text-slate-400 font-mono mb-2">
                  Location: <strong className="text-slate-200">{splice.locationMeter}m</strong> | ST-5400
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#0c1220] p-2 rounded-lg border border-slate-800/80 text-[11px] font-mono mb-2">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Rupture Risk:</span>
                    <strong className={splice.ruptureRiskPercent > 50 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                      {splice.ruptureRiskPercent}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Cord Slip:</span>
                    <strong className={splice.cordPullOutMm > 10 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                      +{splice.cordPullOutMm}mm
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Strain:</span>
                    <strong className="text-slate-200">{splice.dynamicStrainMicrostrain} µε</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Degradation:</span>
                    <strong className="text-slate-200">{splice.degradationPercent}%</strong>
                  </div>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                <span>Inspected: {splice.lastInspected.split(' ')[0]}</span>
                <span className="text-sky-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  <span>Diagnostic Suite</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
