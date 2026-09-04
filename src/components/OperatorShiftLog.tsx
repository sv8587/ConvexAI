import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ClipboardList, 
  Send, 
  Wrench, 
  ShieldCheck, 
  Filter
} from 'lucide-react';
import { audioService } from '../services/audioAlerts';

export interface ShiftEntry {
  id: string;
  time: string;
  author: string;
  role: string;
  type: 'OBSERVATION' | 'WORK_ORDER' | 'HANDOVER' | 'MAINTENANCE';
  text: string;
  spliceTag?: string;
}

const INITIAL_LOGS: ShiftEntry[] = [
  {
    id: 'LOG-801',
    time: '21:45',
    author: 'Rahul Deshmukh',
    role: 'Shift Lead',
    type: 'HANDOVER',
    text: 'Shift A handover to Shift B. Conveyor CV-204 operated continuously at 8,450 TPH average. Splice #4 flagged with elevated pull-out (+14.8mm); monitoring active.',
    spliceTag: 'Splice #4',
  },
  {
    id: 'LOG-794',
    time: '18:42',
    author: 'David Kumar',
    role: 'Reliability Engineer',
    type: 'WORK_ORDER',
    text: 'Dispatched PM Ticket #WO-49210 to Mechanical Crew Alpha for physical inspection of Splice #4 vulcanization joint.',
    spliceTag: 'Splice #4',
  },
  {
    id: 'LOG-780',
    time: '17:18',
    author: 'David Kumar',
    role: 'Reliability Engineer',
    type: 'OBSERVATION',
    text: 'Chute drop camera flagged 185mm surface slit downstream of transfer point. Rubber core intact, no cord breach.',
    spliceTag: 'Chute 1',
  },
  {
    id: 'LOG-750',
    time: '14:10',
    author: 'Sarah Chen',
    role: 'Condition Monitoring Tech',
    type: 'MAINTENANCE',
    text: 'Routine LoRa sensor node gateway battery check completed. All 16 nodes verified operating at nominal voltage (3.8V - 4.2V).',
  },
];

interface OperatorShiftLogProps {
  onDispatchQuickWorkOrder: (title: string) => void;
}

export const OperatorShiftLog: React.FC<OperatorShiftLogProps> = ({
  onDispatchQuickWorkOrder,
}) => {
  const [logs, setLogs] = useState<ShiftEntry[]>(INITIAL_LOGS);
  const [newNote, setNewNote] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const activeAuthor = 'Rahul Deshmukh (Zone Lead)';

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    audioService.playClick(1100, 0.04);
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newEntry: ShiftEntry = {
      id: `LOG-${Math.floor(800 + Math.random() * 200)}`,
      time: timeStr,
      author: activeAuthor,
      role: 'Control Room Operator',
      type: 'OBSERVATION',
      text: newNote.trim(),
    };

    setLogs([newEntry, ...logs]);
    setNewNote('');
  };

  const handleDispatch = (title: string) => {
    audioService.playSuccessChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#38bdf8', '#10b981', '#f59e0b'],
    });
    onDispatchQuickWorkOrder(title);
  };

  const filteredLogs = logs.filter((log) => filterType === 'ALL' || log.type === filterType);

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            <ClipboardList className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <span>Shift Handover & Operator Maintenance Logs</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                Shift A • 24/7 Operations
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time shift log, technician observations, and active work orders for Overland Conveyor CV-204.
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 text-xs bg-[#090d16] p-1 rounded-lg border border-slate-800">
          <Filter className="w-3 h-3 text-slate-500 ml-1" />
          {['ALL', 'WORK_ORDER', 'OBSERVATION', 'HANDOVER', 'MAINTENANCE'].map((type) => (
            <button
              key={type}
              onClick={() => {
                audioService.playClick(1000, 0.02);
                setFilterType(type);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                filterType === type ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {type === 'ALL' ? 'All' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Notes Feed, Right Quick Actions & Handover Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Cols: Chronological Log Feed */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          {/* Quick Input Form */}
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type operator observation or inspection note..."
              className="flex-1 bg-[#090d16] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Note</span>
            </button>
          </form>

          {/* Log Stream */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredLogs.map((entry) => (
              <div 
                key={entry.id}
                className="bg-[#090d16] border border-slate-800/90 rounded-lg p-3 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{entry.author}</span>
                    <span className="text-slate-500 text-[10px] font-mono">• {entry.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                      entry.type === 'WORK_ORDER'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : entry.type === 'HANDOVER'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-slate-800 text-slate-300'
                    }`}>
                      {entry.type}
                    </span>
                    {entry.spliceTag && (
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                        {entry.spliceTag}
                      </span>
                    )}
                    <span className="text-slate-400 font-mono text-[10px]">{entry.time}</span>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Shift Handover Summary & Work Orders Status */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {/* Shift Handover Card */}
          <div className="bg-[#090d16] border border-slate-800 rounded-lg p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Shift Status & Checklist</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-semibold border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Next Handover Window:</span>
                <strong className="text-slate-200">06:00 AEST (Shift B)</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Total Conveyed Today:</span>
                <strong className="text-sky-300">184,200 Tonnes</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Open Work Orders:</span>
                <strong className="text-amber-400">1 Pending Review</strong>
              </div>
            </div>

            <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="text-slate-200 font-semibold block">Supervisory Handover Note:</span>
              <p className="italic">
                "Keep visual line-scan zoomed on Splice #4. Mechanical team is on standby for scheduled belt pause at 02:00."
              </p>
            </div>
          </div>

          {/* Quick Work Order Dispatch Button */}
          <div className="bg-[#090d16] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-200">Need Immediate Field Crew?</div>
              <div className="text-[10px] text-slate-400">Direct dispatch to SAP Plant Maintenance</div>
            </div>
            <button
              onClick={() => handleDispatch('General Conveyor Line Inspection')}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold border border-sky-400/40 flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 active:scale-95"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Dispatch Crew</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
