import React, { useState } from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  X, 
  Filter, 
  ChevronRight, 
  ShieldAlert, 
  Users, 
  Wrench, 
  Radio, 
  Volume2, 
  Clock, 
  ListChecks
} from 'lucide-react';
import type { AlertLog, Severity, AlertCategory } from '../types/telemetry';
import { audioService } from '../services/audioAlerts';

interface InterlockingSidebarProps {
  alerts: AlertLog[];
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onTriggerControlledDecel: () => void;
  onTriggerEmergencyStop: () => void;
  onSelectAlertSplice: (spliceId: number) => void;
}

export const InterlockingSidebar: React.FC<InterlockingSidebarProps> = ({
  alerts,
  isOpen,
  onClose,
  onAcknowledgeAlert,
  onTriggerControlledDecel,
  onTriggerEmergencyStop,
  onSelectAlertSplice,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | AlertCategory>('ALL');
  const [expandedPlaybookId, setExpandedPlaybookId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((alt) => {
    if (categoryFilter === 'ALL') return true;
    return alt.category === categoryFilter;
  });

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;

  const getCategoryIcon = (cat?: AlertCategory) => {
    if (cat === 'CYBER_SECURITY') return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
    if (cat === 'PHYSICAL_SAFETY') return <Users className="w-3.5 h-3.5 text-amber-400" />;
    if (cat === 'SENSOR_RF') return <Radio className="w-3.5 h-3.5 text-sky-400" />;
    return <Wrench className="w-3.5 h-3.5 text-emerald-400" />;
  };

  const getPriorityBadge = (priority?: string) => {
    if (priority === 'P1_EMERGENCY') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-600 text-white animate-pulse">
          P1 AUTO-TRIP
        </span>
      );
    }
    if (priority === 'P2_URGENT') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50">
          P2 URGENT
        </span>
      );
    }
    if (priority === 'P3_HIGH') {
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
          P3 HIGH
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400">
        P4 DIAG
      </span>
    );
  };

  const getSeverityBadge = (sev: Severity) => {
    if (sev === 'CRITICAL') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40 font-mono uppercase">
          Critical
        </span>
      );
    }
    if (sev === 'WARNING') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono uppercase">
          Warning
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono uppercase">
        Advisory
      </span>
    );
  };

  const handleVoiceBroadcast = (alt: AlertLog) => {
    audioService.playClick(1100, 0.04);
    audioService.speakAlert(`Warning: ${alt.title}. Response protocol initiated.`);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#0f172a] border-l border-slate-700 shadow-2xl z-50 flex flex-col justify-between backdrop-blur-md font-sans">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 bg-[#090d16] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 font-mono">
              <span>SCADA ISA-18.2 Alert Center</span>
              {criticalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold">
                  {criticalCount} Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Cyber threats, physical safety intrusions, and mechanical alarms
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

      {/* Filter Tabs by Category */}
      <div className="px-4 py-2 bg-[#0c1220] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1 text-slate-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2 py-0.5 rounded transition-colors ${
              categoryFilter === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setCategoryFilter('CYBER_SECURITY')}
            className={`px-2 py-0.5 rounded transition-colors ${
              categoryFilter === 'CYBER_SECURITY' ? 'bg-purple-900 text-purple-200 font-bold border border-purple-500' : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            Cyber
          </button>
          <button
            onClick={() => setCategoryFilter('PHYSICAL_SAFETY')}
            className={`px-2 py-0.5 rounded transition-colors ${
              categoryFilter === 'PHYSICAL_SAFETY' ? 'bg-amber-900 text-amber-200 font-bold border border-amber-500' : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Safety
          </button>
          <button
            onClick={() => setCategoryFilter('MECHANICAL')}
            className={`px-2 py-0.5 rounded transition-colors ${
              categoryFilter === 'MECHANICAL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mech
          </button>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
            <p>No active anomalies in this category.</p>
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-3.5 rounded-xl border transition-colors font-sans ${
                alt.severity === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-500/70 shadow-md shadow-red-500/10'
                  : alt.severity === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/50'
                    : 'bg-[#090d16] border-slate-800'
              }`}
            >
              {/* Alert Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(alt.category)}
                  {getSeverityBadge(alt.severity)}
                  {getPriorityBadge(alt.priority)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{alt.timestamp}</span>
                  {/* Spoken Audio Annunciator Button */}
                  <button
                    onClick={() => handleVoiceBroadcast(alt)}
                    className="p-1 rounded bg-slate-800 text-sky-400 hover:text-white transition-colors"
                    title="Broadcast Spoken Alert"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="text-xs font-bold text-white mb-1">
                {alt.title}
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                {alt.description}
              </p>

              {/* Metadata Details */}
              <div className="bg-[#0c1220] p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400 space-y-0.5 mb-2.5">
                <div className="flex justify-between">
                  <span>Location / Chainage:</span>
                  <strong className="text-slate-200">{alt.locationMeter}m</strong>
                </div>
                <div className="flex justify-between">
                  <span>Reporting Sensor/Firewall:</span>
                  <strong className="text-slate-200">{alt.sensorId}</strong>
                </div>
                {alt.responseSlaSeconds && (
                  <div className="flex justify-between text-amber-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Response SLA Target:</span>
                    </span>
                    <strong>&lt; {alt.responseSlaSeconds}s</strong>
                  </div>
                )}
                {alt.actionTaken && (
                  <div className="text-emerald-400 border-t border-slate-800 pt-1 mt-1">
                    Mitigation: {alt.actionTaken}
                  </div>
                )}
              </div>

              {/* Incident Response Playbook Dropdown */}
              {alt.playbookSteps && alt.playbookSteps.length > 0 && (
                <div className="mb-2.5">
                  <button
                    onClick={() => setExpandedPlaybookId(expandedPlaybookId === alt.id ? null : alt.id)}
                    className="flex items-center justify-between w-full p-1.5 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-[10px] font-mono text-sky-300 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <ListChecks className="w-3 h-3 text-sky-400" />
                      <span>Incident Response Playbook ({alt.playbookSteps.length} Steps)</span>
                    </span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${expandedPlaybookId === alt.id ? 'rotate-90' : ''}`} />
                  </button>

                  {expandedPlaybookId === alt.id && (
                    <div className="mt-1.5 p-2 bg-[#050811] rounded border border-slate-800 space-y-1.5 text-[10px] font-mono">
                      {alt.playbookSteps.map((step) => (
                        <div key={step.step} className="flex items-center gap-2 text-slate-300">
                          <input
                            type="checkbox"
                            checked={step.completed}
                            readOnly
                            className="rounded accent-sky-500"
                          />
                          <span className={step.completed ? 'line-through text-slate-500' : ''}>
                            {step.step}. {step.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800">
                {alt.spliceId ? (
                  <button
                    onClick={() => {
                      audioService.playClick(1000);
                      onSelectAlertSplice(alt.spliceId!);
                    }}
                    className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Inspect Splice #{alt.spliceId}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : <div />}

                {!alt.acknowledged ? (
                  <button
                    onClick={() => {
                      audioService.playClick(1100);
                      onAcknowledgeAlert(alt.id);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors border border-slate-700 font-mono"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Acknowledged</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Safety Interlock Action Footer */}
      <div className="p-4 bg-[#090d16] border-t border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Manual Emergency Override:</span>
          <span className="text-amber-400 font-semibold">Dual-Channel E-STOP</span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono">
          <button
            onClick={() => {
              audioService.playWarning();
              onTriggerControlledDecel();
            }}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            Controlled Decel (15s)
          </button>

          <button
            onClick={() => {
              audioService.playCyberKlaxon();
              onTriggerEmergencyStop();
            }}
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            Hard E-STOP
          </button>
        </div>
      </div>
    </div>
  );
};
