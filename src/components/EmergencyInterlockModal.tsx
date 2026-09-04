import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Power, 
  Wrench, 
  X
} from 'lucide-react';
import type { SpliceJoint, ConveyorTelemetry } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface EmergencyInterlockModalProps {
  isOpen: boolean;
  splice: SpliceJoint | null;
  telemetry: ConveyorTelemetry;
  onClose: () => void;
  onControlledDecel: () => void;
  onHardStop: () => void;
  onDispatchWorkOrder: () => void;
}

export const EmergencyInterlockModal: React.FC<EmergencyInterlockModalProps> = ({
  isOpen,
  splice,
  telemetry,
  onClose,
  onControlledDecel,
  onHardStop,
  onDispatchWorkOrder,
}) => {
  useEffect(() => {
    if (isOpen) {
      audioService.startEmergencySiren();
    } else {
      audioService.stopAlarm();
    }
    return () => {
      audioService.stopAlarm();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-[#0f172a] border-2 border-red-500/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col relative animate-critical-alert">
        {/* Warning Hazard Bar */}
        <div 
          className="h-2.5 w-full bg-red-600"
        />

        {/* Modal Header */}
        <div className="p-5 bg-red-950/40 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shadow-md">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-600 text-white font-mono">
                  SCADA Interlock Warning
                </span>
                <span className="text-xs text-red-300 font-mono">CV-204</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide mt-0.5">
                Critical Joint Rupture Imminent
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.stopAlarm();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Silence & Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-slate-200 text-xs">
          {/* Key Anomaly Card */}
          <div className="bg-[#090d16] border border-red-500/40 rounded-xl p-4 font-mono space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-red-300 border-b border-slate-800 pb-2">
              <span>{splice ? splice.label : 'Splice #4 (Chainage 2,180m)'}</span>
              <span className="text-red-400 font-bold">Rupture Probability: 92.1%</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div>
                <span className="text-slate-400 text-[10px] block">Cord Pull-Out:</span>
                <strong className="text-red-400 text-base">+{splice?.cordPullOutMm || 14.8} mm</strong>
                <span className="text-[9px] text-slate-500 block">(Max Safe Limit: 12.0mm)</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block">Dynamic Strain:</span>
                <strong className="text-red-400 text-base">{splice?.dynamicStrainMicrostrain || 1280} µε</strong>
                <span className="text-[9px] text-slate-500 block">(Ceiling: 1150 µε)</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] block">Active Tonnage:</span>
                <strong className="text-slate-200 text-base">{telemetry.tonnageTph} TPH</strong>
                <span className="text-[9px] text-slate-500 block">(Speed: {telemetry.speedMps} m/s)</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 font-sans mt-2 pt-2 border-t border-slate-800">
              <strong>Root Cause:</strong> Severe core steel cord pull-out displacement detected via MFL scanner. Vulcanized rubber bond micro-crack propagation exceeds safe limits.
            </div>
          </div>

          <div className="text-center font-medium text-slate-300 text-xs">
            Choose interlock response for Overland Conveyor CV-204:
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Controlled Decel */}
            <button
              onClick={() => {
                audioService.stopAlarm();
                onControlledDecel();
              }}
              className="p-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-sm"
            >
              <div className="text-sm font-bold">1. Controlled Deceleration (15s)</div>
              <span className="text-[10px] font-normal text-slate-900">
                Smooth motor braking to prevent belt surge & spillage
              </span>
            </button>

            {/* Hard E-Stop */}
            <button
              onClick={() => {
                audioService.stopAlarm();
                onHardStop();
              }}
              className="p-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors shadow-sm"
            >
              <div className="text-sm font-bold flex items-center gap-1.5">
                <Power className="w-4 h-4" />
                <span>2. Emergency Hard Stop</span>
              </div>
              <span className="text-[10px] font-normal text-red-200">
                Immediate mechanical brake engagement
              </span>
            </button>
          </div>
        </div>

        {/* Footer info & Silence */}
        <div className="p-4 px-5 bg-[#090d16] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              audioService.stopAlarm();
              onDispatchWorkOrder();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Generate Emergency Work Order</span>
          </button>

          <button
            onClick={() => {
              audioService.stopAlarm();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Acknowledge & Silence Siren
          </button>
        </div>
      </div>
    </div>
  );
};
