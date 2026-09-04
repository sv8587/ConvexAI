import React from 'react';
import { 
  HeartPulse, 
  Gauge, 
  Clock, 
  AlertOctagon, 
  TrendingUp, 
  TrendingDown, 
  Radio
} from 'lucide-react';
import type { ConveyorTelemetry, MLMetrics } from '../types/telemetry';

interface HeroMetricsBarProps {
  telemetry: ConveyorTelemetry;
  mlMetrics: MLMetrics;
  criticalAlertCount: number;
  warningAlertCount: number;
  onOpenAlerts: () => void;
}

export const HeroMetricsBar: React.FC<HeroMetricsBarProps> = ({
  telemetry,
  mlMetrics,
  criticalAlertCount,
  warningAlertCount,
  onOpenAlerts,
}) => {
  const health = mlMetrics.overallHealthScore;

  const getHealthStatusBadge = () => {
    if (health >= 85) {
      return (
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>Optimal</span>
        </span>
      );
    }
    if (health >= 65) {
      return (
        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          <span>Degraded</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
        Critical Wear
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 px-5 pt-3">
      {/* 1. Overall Belt Health Index (%) */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-sky-400" />
            <span>Belt Health Index</span>
          </span>
          {getHealthStatusBadge()}
        </div>

        <div className="my-2">
          <div className="text-3xl font-bold text-white font-mono tracking-tight">
            {health.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                health >= 85 ? 'bg-emerald-500' : health >= 65 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, health)}%` }}
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
          <span>Anomaly Score:</span>
          <strong className="text-slate-200">{mlMetrics.isolationForestAnomalyScore.toFixed(2)} / 1.0</strong>
        </div>
      </div>

      {/* 2. Speed & Tonnage Throughput */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-sky-400" />
            <span>Throughput & Speed</span>
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
            telemetry.isRunning ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-400'
          }`}>
            {telemetry.isRunning ? 'Running' : 'Paused'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2">
          <div>
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {telemetry.isRunning ? telemetry.speedMps.toFixed(1) : '0.0'}
              <span className="text-xs text-slate-400 font-normal ml-1">m/s</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {telemetry.isRunning ? telemetry.speedRpm : 0} RPM
            </span>
          </div>

          <div className="border-l border-slate-800 pl-3">
            <div className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
              {telemetry.isRunning ? (telemetry.tonnageTph / 1000).toFixed(2) : '0.00'}
              <span className="text-xs text-slate-400 font-normal ml-1">kt/h</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {telemetry.isRunning ? telemetry.tonnageTph.toLocaleString() : 0} TPH
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
          <span>Target Capacity:</span>
          <strong className="text-slate-200">10,000 TPH</strong>
        </div>
      </div>

      {/* 3. Estimated RUL Window */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Predicted RUL</span>
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
            95% CI
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold font-mono tracking-tight ${
              mlMetrics.rulHoursRemaining < 24 ? 'text-red-400' : 'text-slate-100'
            }`}>
              {mlMetrics.rulHoursRemaining.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">Hours Remaining</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Interval: <span className="text-slate-200 font-medium">{mlMetrics.rulConfidenceInterval[0]}h – {mlMetrics.rulConfidenceInterval[1]}h</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
          <span>Governing Component:</span>
          <strong className="text-slate-200">Splice #4</strong>
        </div>
      </div>

      {/* 4. Active Alerts */}
      <div 
        onClick={onOpenAlerts}
        className={`p-4 rounded-xl border cursor-pointer transition-colors shadow-sm flex flex-col justify-between ${
          criticalAlertCount > 0 
            ? 'bg-red-950/20 border-red-500/80 hover:bg-red-950/30' 
            : warningAlertCount > 0
              ? 'bg-amber-950/20 border-amber-500/60 hover:bg-amber-950/30'
              : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
            <AlertOctagon className={`w-4 h-4 ${criticalAlertCount > 0 ? 'text-red-400' : 'text-amber-400'}`} />
            <span>Active Alerts</span>
          </span>
          <span className="text-[11px] text-sky-400 font-medium">View feed →</span>
        </div>

        <div className="flex items-center gap-3 my-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-bold font-mono tracking-tight ${criticalAlertCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {criticalAlertCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">Critical</span>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
              {warningAlertCount}
            </span>
            <span className="text-[11px] font-medium text-slate-400">Warning</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
          <span>Action Status:</span>
          <strong className={criticalAlertCount > 0 ? 'text-red-400' : 'text-emerald-400'}>
            {criticalAlertCount > 0 ? 'Action Required' : 'All Clear'}
          </strong>
        </div>
      </div>

      {/* 5. LoRa Sensor Mesh */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0f172a] flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-sky-400" />
            <span>Sensor Mesh (LoRa)</span>
          </span>
          <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            915 MHz
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-2 font-mono">
          <div>
            <div className="text-2xl font-bold text-white">16 / 16</div>
            <span className="text-[11px] text-slate-400">Nodes Synced</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <div className="text-2xl font-bold text-emerald-400">0.02%</div>
            <span className="text-[11px] text-slate-400">Packet Loss</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800/80">
          <span>Battery Range:</span>
          <strong className="text-slate-200">3.8V – 4.2V</strong>
        </div>
      </div>
    </div>
  );
};
