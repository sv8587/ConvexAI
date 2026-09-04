import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Users, 
  AlertTriangle, 
  Radio, 
  Key
} from 'lucide-react';
import type { 
  PurdueZoneStatus, 
  CyberThreatEvent, 
  PersonnelZoneTracker, 
  LotoLockRecord 
} from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface OTSecurityCenterProps {
  purdueZones: PurdueZoneStatus[];
  threats: CyberThreatEvent[];
  personnel: PersonnelZoneTracker[];
  lotoLocks: LotoLockRecord[];
  onToggleLotoLock: (lockId: string) => void;
  onQuarantineThreat: (threatId: string) => void;
}

export const OTSecurityCenter: React.FC<OTSecurityCenterProps> = ({
  purdueZones,
  threats,
  personnel,
  lotoLocks,
  onToggleLotoLock,
  onQuarantineThreat,
}) => {
  const [activeSection, setActiveSection] = useState<'PURDUE' | 'CYBER_THREATS' | 'PERSONNEL' | 'LOTO'>('PURDUE');

  const breachPersonnel = personnel.filter(p => p.inExclusionZone);
  const activeThreats = threats.filter(t => t.status !== 'BLOCKED');

  const handleLotoAction = (lockId: string) => {
    audioService.playSuccessChime();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#10b981'],
    });
    onToggleLotoLock(lockId);
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/40 text-indigo-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                OT/ICS Cybersecurity & Physical Safety Center
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                IEC 62443 SL-3
              </span>
              {breachPersonnel.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/50 font-bold animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Nip-Point Red Zone Breach!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Defense-in-depth Purdue model monitoring, Modbus DPI firewall, RF LoRa IDS, and personnel perimeter geofencing.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#050811] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveSection('PURDUE');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'PURDUE'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Purdue Zones (0-3)
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveSection('CYBER_THREATS');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'CYBER_THREATS'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Cyber IDS</span>
            {activeThreats.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveSection('PERSONNEL');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'PERSONNEL'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Nip-Point Safety</span>
          </button>

          <button
            onClick={() => {
              audioService.playClick(1100, 0.03);
              setActiveSection('LOTO');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeSection === 'LOTO'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOTO Vault</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PURDUE MODEL DEFENSE-IN-DEPTH */}
      {activeSection === 'PURDUE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {purdueZones.map((zone) => (
            <div
              key={zone.level}
              className={`p-3.5 rounded-xl border bg-[#070b16] flex flex-col justify-between transition-all ${
                zone.status === 'ELEVATED'
                  ? 'border-amber-500/60 shadow-md shadow-amber-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{zone.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    zone.status === 'ELEVATED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {zone.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed mb-3">
                  {zone.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Firewall Rules:</span>
                  <strong className="text-slate-200">{zone.activeFirewallRules} Active</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>DPI Packets Inspected:</span>
                  <strong className="text-sky-300">{zone.inspectedPackets.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Blocked Threats:</span>
                  <strong className={zone.blockedAnomalies > 5 ? 'text-amber-400' : 'text-slate-300'}>
                    {zone.blockedAnomalies} Blocked
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: CYBER THREATS & IDS RADAR */}
      {activeSection === 'CYBER_THREATS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <strong>Real-Time OT Threat Detection Log (Modbus TCP & LoRa RF)</strong>
            </span>
            <span className="text-[11px] text-slate-400">Snort OT Rule Engine v3.4 Active</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {threats.map((threat) => (
              <div
                key={threat.id}
                className="p-3 rounded-xl border border-slate-800 bg-[#070b16] hover:bg-[#0f172a] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white">{threat.threatType}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {threat.timestamp}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {threat.status}
                    </span>
                    <span className="text-slate-400 text-[11px]">Target: <strong className="text-slate-200">{threat.targetDevice}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans">
                    {threat.details}
                  </p>
                  <div className="text-[10px] text-slate-500">
                    Source: <span className="text-slate-400">{threat.sourceIpOrMac}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    audioService.playClick(1200, 0.04);
                    onQuarantineThreat(threat.id);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors whitespace-nowrap"
                >
                  Quarantine Origin
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: PHYSICAL RED-ZONE & NIP-POINT SAFETY */}
      {activeSection === 'PERSONNEL' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <strong>Worker Geofence Tracking & Machine Nip-Point Safety</strong>
            </span>
            <span className="text-[11px] text-slate-400">Optical Light Curtains: ENERGIZED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {personnel.map((worker) => (
              <div
                key={worker.id}
                className={`p-3.5 rounded-xl border bg-[#070b16] flex flex-col justify-between transition-all ${
                  worker.inExclusionZone
                    ? 'border-red-500 bg-red-950/30 shadow-lg shadow-red-500/20 animate-pulse'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-white text-xs">{worker.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      worker.inExclusionZone
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {worker.rfidTag}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mb-2">{worker.role}</div>
                  <div className="text-[11px] text-slate-300 mb-2">
                    Location: <strong className="text-slate-100">{worker.currentZone}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Nip-Point Distance:</span>
                    <strong className={worker.safetyDistanceM < 2.0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {worker.safetyDistanceM} m
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">LOTO Clearance:</span>
                    <strong className={worker.lotoAuthorized ? 'text-emerald-400' : 'text-slate-500'}>
                      {worker.lotoAuthorized ? 'AUTHORIZED' : 'NO LOTO KEY'}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: DIGITAL LOCKOUT / TAGOUT (LOTO) VAULT */}
      {activeSection === 'LOTO' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <strong>Cryptographically Signed Lockout / Tagout (LOTO) Vault</strong>
            </span>
            <span className="text-[11px] text-slate-400">Zero Energy Isolation Standard AS 4024</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {lotoLocks.map((lock) => {
              const isLocked = lock.status === 'LOCKED' || lock.status === 'VERIFIED_ZERO_ENERGY';
              return (
                <div
                  key={lock.lockId}
                  className={`p-3.5 rounded-xl border bg-[#070b16] flex flex-col justify-between transition-all ${
                    isLocked ? 'border-amber-500/60 shadow-sm shadow-amber-500/10' : 'border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white text-xs">{lock.lockId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isLocked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {lock.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-200 mb-1">{lock.pointName}</div>
                    <div className="text-[11px] text-slate-400 font-sans mb-3">
                      Master Key Holder: <strong className="text-slate-300">{lock.appliedBy}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">Key Hash: {lock.keyHash}</span>
                    <button
                      onClick={() => handleLotoAction(lock.lockId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{isLocked ? 'Release LOTO' : 'Engage LOTO'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
