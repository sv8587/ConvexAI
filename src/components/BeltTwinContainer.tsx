import React, { useState } from 'react';
import { 
  Box, 
  Layers, 
  Columns, 
  Activity, 
  AlertTriangle
} from 'lucide-react';
import type { SpliceJoint, DamageMarker, ConveyorTelemetry } from '../types/telemetry';
import { BeltTwin3DVisualizer } from './BeltTwin3DVisualizer';
import { BeltTwinVisualizer } from './BeltTwinVisualizer';
import { audioService } from '../services/audioAlerts';

interface BeltTwinContainerProps {
  splices: SpliceJoint[];
  anomalies: DamageMarker[];
  telemetry: ConveyorTelemetry;
  selectedSplice: SpliceJoint | null;
  onSelectSplice: (splice: SpliceJoint) => void;
  onSelectAnomaly: (anomaly: DamageMarker) => void;
}

export const BeltTwinContainer: React.FC<BeltTwinContainerProps> = ({
  splices,
  anomalies,
  telemetry,
  selectedSplice,
  onSelectSplice,
  onSelectAnomaly,
}) => {
  const [twinMode, setTwinMode] = useState<'3D' | '2D' | 'SPLIT'>('3D');

  const criticalSplice = splices.find(s => s.status === 'CRITICAL');

  return (
    <div className="bg-[#0b101d] border border-slate-800/90 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
      {/* Container Header with View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 border border-sky-500/40 text-sky-400 shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Conveyor Physical Digital Twin & Splice Mesh
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300">
                0m → 4,800m Loop
              </span>
              {criticalSplice && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Splice #{criticalSplice.id} Hazard
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time spatial kinematic modeling, dynamic steel cord strain, and surface defect tracking.
            </p>
          </div>
        </div>

        {/* View Mode Switcher (3D / 2D / Split) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setTwinMode('3D');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                twinMode === '3D'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Spatial Twin</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setTwinMode('2D');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                twinMode === '2D'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D SCADA Track</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick(1100, 0.04);
                setTwinMode('SPLIT');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                twinMode === 'SPLIT'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/20 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Display Area */}
      {twinMode === '3D' && (
        <BeltTwin3DVisualizer
          splices={splices}
          anomalies={anomalies}
          telemetry={telemetry}
          selectedSplice={selectedSplice}
          onSelectSplice={onSelectSplice}
          onSelectAnomaly={onSelectAnomaly}
        />
      )}

      {twinMode === '2D' && (
        <BeltTwinVisualizer
          splices={splices}
          anomalies={anomalies}
          telemetry={telemetry}
          selectedSplice={selectedSplice}
          onSelectSplice={onSelectSplice}
          onSelectAnomaly={onSelectAnomaly}
        />
      )}

      {twinMode === 'SPLIT' && (
        <div className="space-y-4">
          <BeltTwin3DVisualizer
            splices={splices}
            anomalies={anomalies}
            telemetry={telemetry}
            selectedSplice={selectedSplice}
            onSelectSplice={onSelectSplice}
            onSelectAnomaly={onSelectAnomaly}
          />
          <BeltTwinVisualizer
            splices={splices}
            anomalies={anomalies}
            telemetry={telemetry}
            selectedSplice={selectedSplice}
            onSelectSplice={onSelectSplice}
            onSelectAnomaly={onSelectAnomaly}
          />
        </div>
      )}
    </div>
  );
};
