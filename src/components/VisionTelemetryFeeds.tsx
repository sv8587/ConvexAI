import React, { useState } from 'react';
import { 
  Camera, 
  Pause, 
  Play, 
  Wifi, 
  BatteryCharging
} from 'lucide-react';
import type { SensorNode, ConveyorTelemetry } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface VisionTelemetryFeedsProps {
  nodes: SensorNode[];
  telemetry: ConveyorTelemetry;
}

export const VisionTelemetryFeeds: React.FC<VisionTelemetryFeedsProps> = ({
  nodes,
  telemetry,
}) => {
  const [activeCam, setActiveCam] = useState<'TOP_VISION' | 'MFL_SCANNER'>('TOP_VISION');
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Camera className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Live Visual Inspection & Sensor Feeds</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {telemetry.isRunning && !isFrozen ? 'Live 60 FPS' : 'Paused'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              High-speed line scan optical inspection & subsurface magnetic flux telemetry.
            </p>
          </div>
        </div>

        {/* Camera Selector & Pause */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <button
            onClick={() => {
              audioService.playClick(1000);
              setActiveCam('TOP_VISION');
            }}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              activeCam === 'TOP_VISION' ? 'bg-slate-700 border-slate-600 text-white font-semibold' : 'bg-[#090d16] border-slate-800 text-slate-400'
            }`}
          >
            Camera 01: Top Surface
          </button>
          <button
            onClick={() => {
              audioService.playClick(1000);
              setActiveCam('MFL_SCANNER');
            }}
            className={`px-3 py-1.5 rounded-lg border transition-colors ${
              activeCam === 'MFL_SCANNER' ? 'bg-slate-700 border-slate-600 text-white font-semibold' : 'bg-[#090d16] border-slate-800 text-slate-400'
            }`}
          >
            Scanner 02: MFL Subsurface
          </button>

          <button
            onClick={() => {
              audioService.playClick(800);
              setIsFrozen(!isFrozen);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              isFrozen ? 'bg-amber-600 border-amber-500 text-white' : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isFrozen ? 'Resume Live Feed' : 'Pause Feed Frame'}
          >
            {isFrozen ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Stream Visualizer (7 Cols) */}
        <div className="lg:col-span-7 bg-[#050811] border border-slate-800 rounded-lg overflow-hidden relative flex flex-col justify-between h-72">
          {/* Top Camera Overlay */}
          <div className="flex items-center justify-between p-2.5 bg-black/70 backdrop-blur z-20 text-xs font-mono text-slate-300 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <strong className="text-white">
                {activeCam === 'TOP_VISION' ? 'CAM-01 [Overland Surface Scanner]' : 'MFL-01 [Steel Cord Flux Scanner]'}
              </strong>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span>FPS: <strong className="text-slate-200">59.8</strong></span>
              <span>Exp: <strong className="text-slate-200">120µs</strong></span>
            </div>
          </div>

          {/* Video / Scan Feed Simulation */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            <div 
              className={`absolute inset-0 opacity-30 ${
                telemetry.isRunning && !isFrozen ? 'belt-moving-subtle' : 'belt-stopped-subtle'
              }`}
            />

            {/* AI Bounding Box Overlays */}
            {showBoundingBoxes && (
              <>
                {activeCam === 'TOP_VISION' ? (
                  <>
                    <div className="absolute top-12 left-1/4 w-32 h-20 border-2 border-amber-400/90 bg-amber-500/10 rounded p-1 z-20">
                      <div className="bg-amber-500 text-slate-950 text-[9px] font-bold font-mono px-1 py-0.2 rounded w-max">
                        Gouge #104 (96%)
                      </div>
                      <div className="text-[8px] font-mono text-amber-200 mt-1">
                        Depth: 6.2mm • Rubber Top
                      </div>
                    </div>

                    <div className="absolute bottom-10 right-1/4 w-44 h-16 border-2 border-sky-400/90 bg-sky-500/10 rounded p-1 z-20">
                      <div className="bg-sky-500 text-slate-950 text-[9px] font-bold font-mono px-1 py-0.2 rounded w-max">
                        Splice #4 Step Joint
                      </div>
                      <div className="text-[8px] font-mono text-sky-200 mt-1">
                        Displacement: +14.8mm [Attention]
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-4 border border-slate-700 bg-slate-900/60 rounded p-3 flex flex-col justify-between z-20 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>MAGNETIC FLUX EDDY PROFILE</span>
                      <span className="text-red-400 font-bold">FLUX LEAKAGE: 78.4 mV</span>
                    </div>

                    <div className="h-10 w-full flex items-center justify-around border-y border-slate-800 py-1">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-2 rounded-t transition-all ${
                            i === 6 || i === 7 ? 'bg-red-500 h-8' : 'bg-slate-500 h-3'
                          }`} 
                        />
                      ))}
                    </div>

                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>Cord #1</span>
                      <span className="text-red-400 font-semibold">Cord #14 Anomaly Detected</span>
                      <span>Cord #28</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Feed Bar */}
          <div className="flex items-center justify-between p-2 bg-black/70 backdrop-blur z-20 text-[11px] font-mono text-slate-400 border-t border-slate-800">
            <span>Sensor Calibration: Nominal</span>
            <button
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
              className="text-sky-400 hover:text-sky-300"
            >
              {showBoundingBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
            </button>
          </div>
        </div>

        {/* Right 5 Cols: ESP32 Sensor Nodes Telemetry */}
        <div className="lg:col-span-5 bg-[#090d16] border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Wifi className="w-4 h-4 text-sky-400" />
                <span>Field Sensor Nodes (LoRa)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                16/16 Active
              </span>
            </div>

            {/* Sensor nodes list */}
            <div className="space-y-1.5 overflow-y-auto max-h-52 pr-1">
              {nodes.map((node) => (
                <div 
                  key={node.nodeId} 
                  className="bg-[#0f172a] hover:bg-slate-800 p-2 rounded border border-slate-800 text-xs font-mono flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <span className="text-sky-400">{node.nodeId}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-sans">{node.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{node.location}</span>
                      <span>|</span>
                      <span>Vib: <strong className="text-slate-300">{node.vibrationRms} mm/s</strong></span>
                      <span>|</span>
                      <span>Temp: <strong className={node.temperature > 50 ? 'text-amber-400' : 'text-slate-300'}>{node.temperature}°C</strong></span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                      <span>{node.batteryVoltage}V</span>
                    </span>
                    <span className={`text-[10px] font-semibold ${node.rssi > -70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {node.rssi} dBm
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800 pt-2 mt-2">
            <span>LoRa: 915.0 MHz</span>
            <span className="text-slate-400">Gateway: GW-MINE-04</span>
          </div>
        </div>
      </div>
    </div>
  );
};
