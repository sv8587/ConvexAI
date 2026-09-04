import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  BarChart3, 
  Cpu, 
  ShieldCheck, 
  Sliders, 
  Compass, 
  Zap
} from 'lucide-react';
import type { MLMetrics } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface MLAnalyticsPanelProps {
  mlMetrics: MLMetrics;
  selectedSpliceId: number;
}

export const MLAnalyticsPanel: React.FC<MLAnalyticsPanelProps> = ({
  mlMetrics,
  selectedSpliceId,
}) => {
  const [activeTab, setActiveTab] = useState<'STRAIN' | 'WHAT_IF' | 'RADAR_DIAG' | 'VIBRATION' | 'DAMAGE_DIST'>('STRAIN');

  // What-If Simulator Inputs
  const [simTensionKn, setSimTensionKn] = useState<number>(410); // 300 to 700 kN
  const [simDropHeightM, setSimDropHeightM] = useState<number>(2.8); // 1.0 to 5.0m
  const [simLumpSizeMm, setSimLumpSizeMm] = useState<number>(180); // 50 to 400mm
  const [simBeltSpeed, setSimBeltSpeed] = useState<number>(4.8); // 2.0 to 6.5 m/s

  // Real-time What-If Physical Model Calculations
  const whatIfResults = useMemo(() => {
    // 1. Dynamic Ore Impact Force (approx F = m * v_drop / dt)
    const massKg = (Math.PI / 6) * Math.pow(simLumpSizeMm / 1000, 3) * 2800; // iron ore density ~2800 kg/m3
    const vDrop = Math.sqrt(2 * 9.81 * simDropHeightM);
    const impactForceKn = (massKg * vDrop) / 0.05 / 1000;

    // 2. Total Combined Peak Dynamic Tension
    const totalPeakStrainUe = Math.round(650 + (simTensionKn - 400) * 1.8 + impactForceKn * 12 + (simBeltSpeed - 4.8) * 45);

    // 3. Weibull Cumulative Failure Probability: Pf(t) = 1 - exp(-(t/eta)^beta)
    // As strain increases beyond 1000 uE, eta shrinks dramatically
    const stressRatio = totalPeakStrainUe / 1150;
    const etaHours = Math.max(8, Math.round(350 / Math.pow(Math.max(0.6, stressRatio), 3.4)));
    const beta = 2.4; // Wear-out phase
    const timeT = 48; // Evaluating at 48 operational hours
    const weibullPf = Number(((1 - Math.exp(-Math.pow(timeT / etaHours, beta))) * 100).toFixed(1));

    // 4. Fatigue Cycles To Failure (Wöhler S-N Curve for steel cord ST-5400)
    const cyclesToFailure = Math.max(25000, Math.round(1800000 / Math.pow(stressRatio, 4.2)));

    // 5. Projected Remaining Useful Life in Hours
    const projectedRul = Math.max(4.5, Number((etaHours * 0.85).toFixed(1)));

    return {
      impactForceKn: Number(impactForceKn.toFixed(2)),
      totalPeakStrainUe,
      weibullPf: Math.min(99.9, weibullPf),
      cyclesToFailure,
      projectedRul,
      stressRatio: Number(stressRatio.toFixed(2)),
    };
  }, [simTensionKn, simDropHeightM, simLumpSizeMm, simBeltSpeed]);

  const strainSeries = mlMetrics.historicalStrainSeries;
  const dist = mlMetrics.damageDistribution;
  const totalDamages = dist.longitudinalTears + dist.surfaceGouges + dist.spliceSlippage + dist.edgeWear + dist.foreignObjects;

  // Chart dimensions
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 35;
  const chartW = svgWidth - padding * 2;
  const chartH = svgHeight - padding * 2;

  const minStrain = 400;
  const maxStrain = 1500;
  const getY = (val: number) => {
    const clamped = Math.max(minStrain, Math.min(maxStrain, val));
    return padding + chartH - ((clamped - minStrain) / (maxStrain - minStrain)) * chartH;
  };

  const actualPoints = strainSeries.map((pt, idx) => {
    const x = padding + (idx / (strainSeries.length - 1)) * chartW;
    const y = getY(pt.actual);
    return `${x},${y}`;
  }).join(' ');

  const upperLimitY = getY(1150);
  const baselineY = getY(650);

  // Radar Chart Calculations for 6 Features
  // Center at (150, 100), radius 70
  const radarCenter = { x: 150, y: 100 };
  const radarRadius = 70;
  const radarAxes = [
    { label: 'Microstrain', baseline: 0.45, current: Math.min(1.0, whatIfResults.totalPeakStrainUe / 1400) },
    { label: 'Vib Kurtosis', baseline: 0.35, current: 0.68 },
    { label: 'Temp Delta', baseline: 0.30, current: 0.58 },
    { label: 'Cord Slip', baseline: 0.20, current: 0.92 },
    { label: 'Acoustic Emission', baseline: 0.25, current: 0.74 },
    { label: 'LoRa Jitter', baseline: 0.15, current: 0.42 },
  ];

  const getRadarPoint = (index: number, val: number) => {
    const angle = (Math.PI * 2 / radarAxes.length) * index - Math.PI / 2;
    const r = val * radarRadius;
    return {
      x: radarCenter.x + r * Math.cos(angle),
      y: radarCenter.y + r * Math.sin(angle),
    };
  };

  const baselinePolygon = radarAxes.map((a, i) => {
    const pt = getRadarPoint(i, a.baseline);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const currentPolygon = radarAxes.map((a, i) => {
    const pt = getRadarPoint(i, a.current);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Predictive ML Analytics & Dynamic Physics Twin</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Model {mlMetrics.modelVersion}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live dynamic strain waveforms, Weibull fatigue degradation modeling, and multi-variate anomaly radar.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center flex-wrap gap-1 bg-[#090d16] border border-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveTab('STRAIN');
            }}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'STRAIN' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dynamic Strain (µε)
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveTab('WHAT_IF');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'WHAT_IF' ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-sky-300" />
            <span>What-If Simulator</span>
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveTab('RADAR_DIAG');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
              activeTab === 'RADAR_DIAG' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>6-Axis Radar & FFT</span>
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveTab('VIBRATION');
            }}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'VIBRATION' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vibration Harmonics
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveTab('DAMAGE_DIST');
            }}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'DAMAGE_DIST' ? 'bg-slate-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Damage Breakdown
          </button>
        </div>
      </div>

      {/* Main Grid: Chart/Simulator on Left, Model Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Interactive Chart / Simulator Area */}
        <div className="lg:col-span-2 bg-[#090d16] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between scada-grid">
          {/* TAB 1: STRAIN WAVEFORM */}
          {activeTab === 'STRAIN' && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <strong>Microstrain (µε) – Joint Splice #{selectedSpliceId}</strong>
                </span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-red-500" />
                    <span className="text-red-400">Hazard Limit (1150 µε)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-0.5 bg-sky-400" />
                    <span className="text-sky-300">Live Telemetry</span>
                  </span>
                </div>
              </div>

              {/* SVG Chart */}
              <div className="w-full overflow-hidden">
                <svg className="w-full h-44" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                  {/* Gridlines */}
                  <line x1={padding} y1={upperLimitY} x2={svgWidth - padding} y2={upperLimitY} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
                  <line x1={padding} y1={baselineY} x2={svgWidth - padding} y2={baselineY} stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                  <line x1={padding} y1={padding + chartH} x2={svgWidth - padding} y2={padding + chartH} stroke="#1e293b" strokeWidth="1" />

                  {/* Y Axis */}
                  <text x={padding - 6} y={upperLimitY + 3} fill="#ef4444" fontSize="9" textAnchor="end" fontFamily="monospace">1150</text>
                  <text x={padding - 6} y={baselineY + 3} fill="#10b981" fontSize="9" textAnchor="end" fontFamily="monospace">650</text>
                  <text x={padding - 6} y={padding + chartH} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">400</text>

                  {/* Area Fill */}
                  <defs>
                    <linearGradient id="strainGradClean" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points={`${padding},${padding + chartH} ${actualPoints} ${svgWidth - padding},${padding + chartH}`}
                    fill="url(#strainGradClean)"
                  />

                  {/* Polyline */}
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    points={actualPoints}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* X Axis */}
                  <text x={padding} y={svgHeight - 4} fill="#64748b" fontSize="9" fontFamily="monospace">
                    {strainSeries[0]?.time}
                  </text>
                  <text x={svgWidth / 2} y={svgHeight - 4} fill="#64748b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                    {strainSeries[Math.floor(strainSeries.length / 2)]?.time}
                  </text>
                  <text x={svgWidth - padding} y={svgHeight - 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                    Live ({strainSeries[strainSeries.length - 1]?.time})
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* TAB 2: WHAT-IF SENSITIVITY & WEIBULL SIMULATOR */}
          {activeTab === 'WHAT_IF' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <strong>Interactive Stress & Weibull Fatigue Sandbox</strong>
                </span>
                <span className="text-[10px] text-slate-400">Physics-Informed Neural Surrogate</span>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[#0c1220] p-3 rounded-xl border border-slate-800 text-xs font-mono">
                {/* Slider 1: Belt Tension */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Take-up Tension (kN):</span>
                    <strong className="text-sky-300">{simTensionKn} kN</strong>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="700"
                    step="10"
                    value={simTensionKn}
                    onChange={(e) => {
                      audioService.playTelemetryTick();
                      setSimTensionKn(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Slider 2: Chute Drop Height */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Feeder Drop Height (m):</span>
                    <strong className="text-sky-300">{simDropHeightM} m</strong>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={simDropHeightM}
                    onChange={(e) => {
                      audioService.playTelemetryTick();
                      setSimDropHeightM(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>

                {/* Slider 3: Ore Lump Size */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Max Ore Lump Size (mm):</span>
                    <strong className="text-amber-300">{simLumpSizeMm} mm</strong>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    step="10"
                    value={simLumpSizeMm}
                    onChange={(e) => {
                      audioService.playTelemetryTick();
                      setSimLumpSizeMm(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Slider 4: Belt Velocity */}
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-400">Belt Velocity (m/s):</span>
                    <strong className="text-emerald-300">{simBeltSpeed} m/s</strong>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="6.5"
                    step="0.1"
                    value={simBeltSpeed}
                    onChange={(e) => {
                      audioService.playTelemetryTick();
                      setSimBeltSpeed(Number(e.target.value));
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>

              {/* Calculated Outputs Dashboard */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Dynamic Peak Strain</div>
                  <div className={`text-base font-bold mt-1 ${whatIfResults.totalPeakStrainUe > 1150 ? 'text-red-400' : 'text-slate-100'}`}>
                    {whatIfResults.totalPeakStrainUe} µε
                  </div>
                  <span className="text-[9px] text-slate-500">Limit: 1,150 µε</span>
                </div>

                <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Weibull Rupture Risk</div>
                  <div className={`text-base font-bold mt-1 ${whatIfResults.weibullPf > 40 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {whatIfResults.weibullPf}%
                  </div>
                  <span className="text-[9px] text-slate-500">P_f(48h) cumulative</span>
                </div>

                <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Cycles to Rupture (N_f)</div>
                  <div className="text-base font-bold text-sky-300 mt-1">
                    {whatIfResults.cyclesToFailure.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-slate-500">Wöhler S-N curve</span>
                </div>

                <div className="bg-[#0f172a] p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Projected RUL</div>
                  <div className="text-base font-bold text-amber-300 mt-1">
                    {whatIfResults.projectedRul} hrs
                  </div>
                  <span className="text-[9px] text-slate-500">Safe operation time</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 6-AXIS MULTI-VARIATE RADAR & FFT */}
          {activeTab === 'RADAR_DIAG' && (
            <div className="grid grid-cols-2 gap-3 items-center">
              {/* Radar Chart SVG */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] font-mono text-slate-300 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  <span>Multi-Variate Health Radar</span>
                </div>
                <svg width="300" height="200" viewBox="0 0 300 200">
                  {/* Concentric rings */}
                  {[0.25, 0.5, 0.75, 1.0].map((ring) => (
                    <circle
                      key={ring}
                      cx={radarCenter.x}
                      cy={radarCenter.y}
                      r={radarRadius * ring}
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="1"
                      strokeDasharray={ring < 1.0 ? '2 2' : 'none'}
                    />
                  ))}

                  {/* Axis lines */}
                  {radarAxes.map((axis, i) => {
                    const pt = getRadarPoint(i, 1.0);
                    const labelPt = getRadarPoint(i, 1.25);
                    return (
                      <g key={i}>
                        <line
                          x1={radarCenter.x}
                          y1={radarCenter.y}
                          x2={pt.x}
                          y2={pt.y}
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x={labelPt.x}
                          y={labelPt.y + 3}
                          fill="#94a3b8"
                          fontSize="8"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {axis.label}
                        </text>
                      </g>
                    );
                  })}

                  {/* Baseline polygon (emerald) */}
                  <polygon
                    points={baselinePolygon}
                    fill="#10b981"
                    fillOpacity="0.2"
                    stroke="#10b981"
                    strokeWidth="1.5"
                  />

                  {/* Current observation polygon (purple/red) */}
                  <polygon
                    points={currentPolygon}
                    fill="#a855f7"
                    fillOpacity="0.3"
                    stroke="#c084fc"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* Acoustic Emission / FFT Spectrum */}
              <div className="space-y-2 font-mono text-xs">
                <div className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Acoustic FFT Harmonics (0 - 500 Hz)</span>
                </div>

                <div className="bg-[#0c1220] p-3 rounded-lg border border-slate-800 space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Splice Passage Freq (1.2 Hz)</span>
                      <strong className="text-emerald-400">Nominal</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Idler Bearing Inner Ring BPFI (64.2 Hz)</span>
                      <strong className="text-amber-400">Elevated (6.9 mm/s)</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>High Frequency Ultrasonic Cord Acoustic Emission (24 kHz)</span>
                      <strong className="text-red-400">CRITICAL SPIKE (Splice #4)</strong>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VIBRATION HARMONICS */}
          {activeTab === 'VIBRATION' && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <strong>Tri-axial Bearing Vibration (ISO 10816-3 RMS)</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 my-3">
                <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Head Drive Motor</div>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-1">2.84 mm/s</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-mono">ISO Class I: Normal</div>
                </div>

                <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Snub Pulley #2</div>
                  <div className="text-xl font-bold text-amber-300 font-mono mt-1">4.62 mm/s</div>
                  <div className="text-[10px] text-amber-400 mt-1 font-mono">ISO Class I: Warning</div>
                </div>

                <div className="bg-[#0f172a] p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-mono">Tail Reversal Drum</div>
                  <div className="text-xl font-bold text-slate-100 font-mono mt-1">1.95 mm/s</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-mono">ISO Class I: Normal</div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Drive motor bearing temperatures remain stable at 42.1°C with balanced vibration harmonics.
              </p>
            </div>
          )}

          {/* TAB 5: DAMAGE CLASSIFICATION */}
          {activeTab === 'DAMAGE_DIST' && (
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  <strong>Computer Vision Damage Classification ({totalDamages} total)</strong>
                </span>
              </div>

              <div className="space-y-2.5 my-2">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>Surface Gouges (Rubber Cover)</span>
                    <strong className="text-slate-200">{dist.surfaceGouges} (50%)</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>Edge Wear / Idler Tracking</span>
                    <strong className="text-slate-200">{dist.edgeWear} (28.5%)</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: '28.5%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>Longitudinal Tears (Chute Punctures)</span>
                    <strong className="text-amber-400">{dist.longitudinalTears} (14.2%)</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '14.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                    <span>Steel Cord Splice Slippage</span>
                    <strong className="text-red-400">{dist.spliceSlippage} (7.1%)</strong>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '7.1%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-800 pt-1.5 mt-2">
            <span>Sampling: 100 Hz Continuous Stream</span>
            <span>Physics Engine: Dynamic Transfer Matrix Method (TMM)</span>
          </div>
        </div>

        {/* Right Col: ML Model Diagnostics Card */}
        <div className="bg-[#090d16] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Edge ML Model Status</span>
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Architecture:</span>
                <strong className="text-slate-200">Isolation Forest + RUL LSTM</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Edge Latency:</span>
                <strong className="text-sky-300">{mlMetrics.modelInferenceLatencyMs} ms</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">False Alarm Rejection:</span>
                <strong className="text-emerald-400">{mlMetrics.falsePositiveRejectionRate}%</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Anomaly Threshold:</span>
                <strong className="text-amber-400">0.75 (Live: {mlMetrics.isolationForestAnomalyScore.toFixed(2)})</strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Health Index:</span>
                <strong className={mlMetrics.overallHealthScore < 70 ? 'text-red-400' : 'text-emerald-400'}>
                  {mlMetrics.overallHealthScore}%
                </strong>
              </div>
            </div>
          </div>

          <div className="bg-[#0f172a] p-2.5 rounded border border-slate-800 mt-3 text-[10px] font-mono text-slate-400">
            <span className="text-sky-400 font-semibold block mb-0.5">Continuous Model Tuning</span>
            Physical inspection tickets update model weights automatically every 24h.
          </div>
        </div>
      </div>
    </div>
  );
};
