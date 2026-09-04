import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Radio, 
  Bookmark, 
  ChevronRight
} from 'lucide-react';
import { audioService } from '../services/audioAlerts';

export interface ReplayEventBookmark {
  offsetMinutes: number; // minutes before now (e.g. 15 = 15m ago)
  timeLabel: string;
  title: string;
  type: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  description: string;
}

const REPLAY_BOOKMARKS: ReplayEventBookmark[] = [
  {
    offsetMinutes: 105,
    timeLabel: '14:09',
    title: 'Ore Lump Gouge Detected',
    type: 'ADVISORY',
    description: '4.6mm top cover gouge detected on overland return midpoint (3,120m).',
  },
  {
    offsetMinutes: 65,
    timeLabel: '17:15',
    title: 'Chute Drop Tear (185mm)',
    type: 'WARNING',
    description: 'Sharp iron ore impact slit detected by top high-speed line scan camera.',
  },
  {
    offsetMinutes: 25,
    timeLabel: '18:42',
    title: 'Splice #4 Core Cord Pull-Out (+14.8mm)',
    type: 'CRITICAL',
    description: 'Imminent joint rupture alert! Core steel cord slippage reached 14.8mm (threshold: 12mm).',
  },
];

interface ReplayScrubberProps {
  isReplayMode: boolean;
  replayOffsetMinutes: number; // 0 = LIVE, >0 = minutes in past
  onReplayChange: (offsetMinutes: number, isLive: boolean) => void;
  onBookmarkSelect?: (bookmark: ReplayEventBookmark) => void;
}

export const ReplayScrubber: React.FC<ReplayScrubberProps> = ({
  isReplayMode,
  replayOffsetMinutes,
  onReplayChange,
  onBookmarkSelect,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [nowTimestamp, setNowTimestamp] = useState<number>(() => Date.now());
  const playIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Playback timer
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = window.setInterval(() => {
        onReplayChange(Math.max(0, replayOffsetMinutes - 1), replayOffsetMinutes - 1 <= 0);
        if (replayOffsetMinutes - 1 <= 0) {
          setIsPlaying(false);
          audioService.playSuccessChime();
        }
      }, 1000 / playbackSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, playbackSpeed, replayOffsetMinutes, onReplayChange]);

  const handleSliderChange = (val: number) => {
    audioService.playClick(900, 0.02);
    onReplayChange(val, val === 0);
  };

  const handleSnapLive = () => {
    audioService.playSuccessChime();
    setIsPlaying(false);
    onReplayChange(0, true);
  };

  const togglePlay = () => {
    audioService.playClick(1100, 0.04);
    if (!isPlaying && replayOffsetMinutes === 0) {
      // Start from 60 mins ago if currently at live
      onReplayChange(60, false);
    }
    setIsPlaying(!isPlaying);
  };

  // Format past time string based on offset
  const getFormattedPastTime = (offset: number) => {
    if (offset === 0) return 'LIVE (Present)';
    const d = new Date(nowTimestamp - offset * 60 * 1000);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')} (-${offset}m)`;
  };

  return (
    <div className={`transition-all duration-300 rounded-2xl border p-3.5 shadow-xl ${
      isReplayMode
        ? 'bg-gradient-to-r from-[#181a2e] via-[#0f172a] to-[#181a2e] border-cyan-500/50 shadow-cyan-500/10'
        : 'bg-[#0b101d] border-slate-800'
    }`}>
      {/* Top Bar: Replay Status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg border ${
            isReplayMode ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Blackbox Telemetry & Incident Replay
              </span>
              {isReplayMode ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  REPLAYING: {getFormattedPastTime(replayOffsetMinutes)}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400" />
                  LIVE STREAMING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Playback Controls & Speed Multipliers */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shadow-sm ${
              isPlaying
                ? 'bg-amber-600 text-white shadow-amber-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Replay'}</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-[#050811] p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {[1, 2, 5, 10].map((s) => (
              <button
                key={s}
                onClick={() => {
                  audioService.playClick(1000);
                  setPlaybackSpeed(s);
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playbackSpeed === s ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Snap to LIVE Button */}
          <button
            onClick={handleSnapLive}
            disabled={!isReplayMode}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isReplayMode
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Snap to Live</span>
          </button>
        </div>
      </div>

      {/* Progress Slider Track with Bookmarks */}
      <div className="relative py-2">
        {/* Slider Input */}
        <input
          type="range"
          min="0"
          max="120"
          step="1"
          value={replayOffsetMinutes}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          style={{ direction: 'rtl' }} // right is Live (0), left is past (120)
        />

        {/* Labels below scrubber */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
          <span>-120 min (2h ago)</span>
          <span>-90 min</span>
          <span>-60 min (1h ago)</span>
          <span>-30 min</span>
          <span className="text-emerald-400 font-bold">● LIVE (0m)</span>
        </div>
      </div>

      {/* Incident Bookmarks row */}
      <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span>Incident Markers:</span>
        </span>

        {REPLAY_BOOKMARKS.map((bm, i) => (
          <button
            key={i}
            onClick={() => {
              audioService.playClick(1150, 0.04);
              onReplayChange(bm.offsetMinutes, false);
              if (onBookmarkSelect) onBookmarkSelect(bm);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all text-xs ${
              replayOffsetMinutes === bm.offsetMinutes
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm font-semibold'
                : bm.type === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-800/60 text-red-300 hover:border-red-600'
                  : bm.type === 'WARNING'
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:border-amber-600'
                    : 'bg-[#050811] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className="font-mono font-bold text-[10px] text-slate-400">{bm.timeLabel}</span>
            <span>{bm.title}</span>
            <ChevronRight className="w-3 h-3 opacity-60" />
          </button>
        ))}
      </div>
    </div>
  );
};
