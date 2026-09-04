import React, { useState } from 'react';
import { 
  Crosshair, 
  Flame, 
  AlertTriangle
} from 'lucide-react';
import type { SpliceJoint, DamageMarker, ConveyorTelemetry } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface BeltTwinVisualizerProps {
  splices: SpliceJoint[];
  anomalies: DamageMarker[];
  telemetry: ConveyorTelemetry;
  selectedSplice: SpliceJoint | null;
  onSelectSplice: (splice: SpliceJoint) => void;
  onSelectAnomaly: (anomaly: DamageMarker) => void;
}

export const BeltTwinVisualizer: React.FC<BeltTwinVisualizerProps> = ({
  splices,
  anomalies,
  telemetry,
  selectedSplice,
  onSelectSplice,
  onSelectAnomaly,
}) => {
  const [zoomRange, setZoomRange] = useState<[number, number]>([0, 4800]); // in meters
  const [activeZone, setActiveZone] = useState<string>('FULL');
  const [showStrainHeatmap, setShowStrainHeatmap] = useState<boolean>(true);

  const totalLength = telemetry.totalBeltLengthMeters; // 4800m
  const [minM, maxM] = zoomRange;
  const visibleSpan = maxM - minM;

  const setPresetZone = (zone: string, start: number, end: number) => {
    audioService.playClick(1100, 0.04);
    setActiveZone(zone);
    setZoomRange([start, end]);
  };

  const getSpliceNodeColor = (splice: SpliceJoint) => {
    if (splice.status === 'CRITICAL') return 'bg-red-500 border-red-400 text-white';
    if (splice.status === 'WARNING') return 'bg-amber-500 border-amber-300 text-slate-950';
    if (splice.status === 'ADVISORY') return 'bg-yellow-500 border-yellow-300 text-slate-950';
    return 'bg-emerald-500 border-emerald-300 text-white';
  };

  const getPositionPercent = (meter: number) => {
    if (meter < minM || meter > maxM) return -100;
    return ((meter - minM) / visibleSpan) * 100;
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Crosshair className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Conveyor Loop Physical Twin & Joint Map</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                0m → 4,800m Loop
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 2D linear track with real-time splice displacement and localized damage detection.
            </p>
          </div>
        </div>

        {/* Zone Presets & Layer Toggles */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Zone Presets */}
          <div className="flex items-center gap-1 bg-[#090d16] border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setPresetZone('FULL', 0, 4800)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                activeZone === 'FULL' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Loop (4.8km)
            </button>
            <button
              onClick={() => setPresetZone('ZONE1', 0, 1000)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                activeZone === 'ZONE1' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Drive Head
            </button>
            <button
              onClick={() => setPresetZone('ZONE2', 1000, 2000)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                activeZone === 'ZONE2' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Chute Impact
            </button>
            <button
              onClick={() => setPresetZone('ZONE3', 1800, 3000)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                activeZone === 'ZONE3' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              High Tension
            </button>
            <button
              onClick={() => setPresetZone('ZONE4', 3000, 4800)}
              className={`px-2.5 py-1 rounded transition-colors font-medium ${
                activeZone === 'ZONE4' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tail Reversal
            </button>
          </div>

          {/* Toggle Heatmap */}
          <button
            onClick={() => setShowStrainHeatmap(!showStrainHeatmap)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
              showStrainHeatmap ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-[#090d16] border-slate-800 text-slate-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Strain Map</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Linear Conveyor Track */}
      <div className="bg-[#090d16] border border-slate-800 rounded-lg p-5 pt-6 pb-6 relative scada-grid">
        {/* Conveyor Loop Scale Header */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 px-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Drive Head Station (0m)</span>
          </div>
          <div className="text-slate-400">
            Visible Window: <strong className="text-slate-200">{minM}m – {maxM}m</strong> ({visibleSpan}m)
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Tail Pulley ({totalLength}m)</span>
            <span className="w-2 h-2 rounded-full bg-slate-600" />
          </div>
        </div>

        {/* Linear Conveyor Belt Graphic */}
        <div className="relative my-4">
          {/* Main Belt Bed Track */}
          <div className="h-12 w-full bg-[#0c1220] rounded-lg border border-slate-700 relative flex items-center px-1 overflow-hidden shadow-inner">
            {/* Strain Heatmap Overlay */}
            {showStrainHeatmap && (
              <div 
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, 
                    rgba(16, 185, 129, 0.2) 0%, 
                    rgba(16, 185, 129, 0.2) 25%, 
                    rgba(245, 158, 11, 0.3) 30%, 
                    rgba(239, 68, 68, 0.6) 45%, 
                    rgba(239, 68, 68, 0.7) 48%, 
                    rgba(245, 158, 11, 0.3) 55%, 
                    rgba(16, 185, 129, 0.2) 75%, 
                    rgba(245, 158, 11, 0.3) 80%, 
                    rgba(16, 185, 129, 0.2) 100%
                  )`
                }}
              />
            )}

            {/* Subtle Belt Texture Animation */}
            <div 
              className={`absolute inset-0 ${telemetry.isRunning ? 'belt-moving-subtle' : 'belt-stopped-subtle'} opacity-40 pointer-events-none`}
            />

            {/* Central Guide Line */}
            <div className="w-full h-px bg-slate-600/80 absolute top-1/2 -translate-y-1/2 z-0" />

            {/* Scale meter markers */}
            <div className="absolute inset-x-0 bottom-1 flex justify-between px-2 text-[9px] font-mono text-slate-500 pointer-events-none">
              <span>{minM}m</span>
              <span>{Math.round(minM + visibleSpan * 0.25)}m</span>
              <span>{Math.round(minM + visibleSpan * 0.5)}m</span>
              <span>{Math.round(minM + visibleSpan * 0.75)}m</span>
              <span>{maxM}m</span>
            </div>

            {/* Splices Render on Track */}
            {splices.map((splice) => {
              const pos = getPositionPercent(splice.locationMeter);
              if (pos < -5 || pos > 105) return null;
              const isSelected = selectedSplice?.id === splice.id;

              return (
                <div
                  key={`splice-${splice.id}`}
                  style={{ left: `${pos}%` }}
                  onClick={() => {
                    audioService.playClick(900, 0.05);
                    onSelectSplice(splice);
                  }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 cursor-pointer transition-transform duration-150 group ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105'
                  }`}
                >
                  <div className={`w-7 h-9 rounded flex flex-col items-center justify-between p-1 border shadow-md ${getSpliceNodeColor(splice)}`}>
                    <span className="text-[7px] font-black uppercase">SP</span>
                    <span className="text-[9px] font-black leading-none">#{splice.id}</span>
                    <div className="w-full h-0.5 bg-white/40 rounded-full" />
                  </div>

                  {/* Top Pointer */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white" />

                  {/* Concise Hover Card */}
                  <div className="hidden group-hover:block absolute bottom-12 left-1/2 -translate-x-1/2 w-52 p-2.5 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl z-50 text-xs text-slate-200 pointer-events-none">
                    <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1 mb-1">
                      <span className="text-white">Splice #{splice.id}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        splice.status === 'CRITICAL' ? 'bg-red-500 text-white font-bold' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {splice.status}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[11px] font-mono text-slate-300">
                      <div>Location: <strong className="text-white">{splice.locationMeter}m</strong></div>
                      <div>Rupture Risk: <strong className={splice.ruptureRiskPercent > 50 ? 'text-red-400' : 'text-slate-200'}>{splice.ruptureRiskPercent}%</strong></div>
                      <div>Cord Slip: <strong className="text-slate-200">+{splice.cordPullOutMm}mm</strong></div>
                      <div>Dynamic Strain: <strong className="text-slate-200">{splice.dynamicStrainMicrostrain} µε</strong></div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI Vision Anomaly Markers */}
            {anomalies.map((anomaly) => {
              const pos = getPositionPercent(anomaly.locationMeter);
              if (pos < -5 || pos > 105) return null;

              return (
                <div
                  key={`anomaly-${anomaly.id}`}
                  style={{ left: `${pos}%` }}
                  onClick={() => {
                    audioService.playClick(1200, 0.04);
                    onSelectAnomaly(anomaly);
                  }}
                  className="absolute -top-3 -translate-x-1/2 z-20 cursor-pointer group"
                >
                  <div className={`p-1 rounded-full border shadow ${
                    anomaly.severity === 'CRITICAL'
                      ? 'bg-red-600 border-red-300 text-white'
                      : 'bg-amber-500 border-amber-200 text-slate-950'
                  }`}>
                    <AlertTriangle className="w-3 h-3" />
                  </div>

                  {/* Anomaly Hover Card */}
                  <div className="hidden group-hover:block absolute top-7 left-1/2 -translate-x-1/2 w-52 p-2 bg-[#0f172a] border border-slate-700 rounded-lg shadow-xl z-50 text-xs text-slate-200 pointer-events-none">
                    <div className="font-bold text-amber-400 border-b border-slate-800 pb-1 mb-1">
                      {anomaly.label}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                      <div>Chainage: {anomaly.locationMeter}m</div>
                      <div>Confidence: {(anomaly.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Quick Splice Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2 border-t border-slate-800/80">
          {splices.map((splice) => {
            const isSelected = selectedSplice?.id === splice.id;
            return (
              <button
                key={`strip-${splice.id}`}
                onClick={() => {
                  audioService.playClick(950, 0.04);
                  onSelectSplice(splice);
                }}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  isSelected 
                    ? 'bg-slate-800 border-slate-500 shadow-sm' 
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white font-mono">Joint #{splice.id}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    splice.status === 'CRITICAL' ? 'bg-red-500' : splice.status === 'WARNING' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  <div>Risk: <strong className={splice.ruptureRiskPercent > 50 ? 'text-red-400 font-bold' : 'text-slate-300'}>{splice.ruptureRiskPercent}%</strong></div>
                  <div>Slip: <span className="text-slate-200">+{splice.cordPullOutMm}mm</span></div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
