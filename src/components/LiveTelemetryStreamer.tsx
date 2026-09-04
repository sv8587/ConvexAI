import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Pause, 
  Copy, 
  CheckCircle2
} from 'lucide-react';
import { audioService } from '../services/audioAlerts';

interface TelemetryPacket {
  id: string;
  timestamp: string;
  nodeId: string;
  protocol: 'LoRa_SX1278' | 'HighSpeed_Optic' | 'MFL_Ultrasonic';
  hexDump: string;
  strainUe: number;
  vibeRms: number;
  tempC: number;
  rssi: number;
  crc: 'OK' | 'ERR';
}

interface LiveTelemetryStreamerProps {
  isRunning: boolean;
}

const NODES = ['ESP-01', 'ESP-04', 'CAM-01', 'MFL-01', 'ESP-07', 'ESP-12'];

export const LiveTelemetryStreamer: React.FC<LiveTelemetryStreamerProps> = ({
  isRunning,
}) => {
  const [streamRateMs, setStreamRateMs] = useState<number>(500);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [packets, setPackets] = useState<TelemetryPacket[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [packetCounter, setPacketCounter] = useState<number>(14280);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStreaming || !isRunning) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      const randomNode = NODES[Math.floor(Math.random() * NODES.length)];
      const isMflOrCam = randomNode.startsWith('CAM') || randomNode.startsWith('MFL');

      const hexBytes = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(' ');

      const newPacket: TelemetryPacket = {
        id: `PKT-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: timeStr,
        nodeId: randomNode,
        protocol: isMflOrCam ? (randomNode.startsWith('CAM') ? 'HighSpeed_Optic' : 'MFL_Ultrasonic') : 'LoRa_SX1278',
        hexDump: `0xAA 0x14 ${hexBytes} 0xFF`,
        strainUe: randomNode === 'ESP-04' ? Math.round(1240 + Math.random() * 60) : Math.round(630 + Math.random() * 40),
        vibeRms: Number((2.2 + Math.random() * 2.5).toFixed(2)),
        tempC: Number((34.0 + Math.random() * 12.0).toFixed(1)),
        rssi: -60 - Math.floor(Math.random() * 25),
        crc: Math.random() > 0.02 ? 'OK' : 'ERR',
      };

      setPackets((prev) => [newPacket, ...prev.slice(0, 35)]);
      setPacketCounter((c) => c + 1);
    }, streamRateMs);

    return () => clearInterval(interval);
  }, [isStreaming, isRunning, streamRateMs]);

  const copyPacket = (pkt: TelemetryPacket) => {
    audioService.playClick(1200, 0.03);
    navigator.clipboard.writeText(JSON.stringify(pkt, null, 2));
    setCopiedId(pkt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-sky-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Live SCADA Mesh Telemetry Streamer
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isStreaming && isRunning ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {isStreaming && isRunning ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Demultiplexed LoRa SX1278 payload packets & edge vision telemetry buffer.
            </p>
          </div>
        </div>

        {/* Controls: Stream Rate & Pause/Resume */}
        <div className="flex items-center gap-2 text-xs">
          {/* Stream Rate Selector */}
          <div className="flex items-center bg-[#050811] p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-500 px-2">Rate:</span>
            {[100, 500, 2000].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  audioService.playClick(1000);
                  setStreamRateMs(rate);
                }}
                className={`px-2 py-0.5 rounded transition-colors ${
                  streamRateMs === rate ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate === 100 ? '100ms (Burst)' : rate === 500 ? '500ms' : '2s (Eco)'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              audioService.playClick(850);
              setIsStreaming(!isStreaming);
            }}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all border ${
              isStreaming
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white'
                : 'bg-emerald-600 border-emerald-500 text-white shadow-md'
            }`}
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isStreaming ? 'Pause Stream' : 'Resume'}</span>
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-4 gap-2 text-[11px] text-slate-300 bg-[#050811] p-2 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-slate-500 text-[10px] block">Rx Packets:</span>
          <strong className="text-white">#{packetCounter.toLocaleString()}</strong>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Mesh Topology:</span>
          <strong className="text-sky-400">Star-of-Stars LoRa</strong>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">CRC Integrity:</span>
          <strong className="text-emerald-400">99.8% Passed</strong>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">Active Sensors:</span>
          <strong className="text-slate-200">16 / 16 Nodes Online</strong>
        </div>
      </div>

      {/* Terminal Stream Feed */}
      <div
        ref={scrollRef}
        className="max-h-56 overflow-y-auto space-y-1.5 pr-1 text-xs"
      >
        {packets.map((pkt) => (
          <div
            key={pkt.id}
            className="flex items-center justify-between p-2 rounded-lg bg-[#070b16] hover:bg-[#0f172a] border border-slate-800/60 transition-colors text-[11px]"
          >
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-slate-500 font-mono">{pkt.timestamp}</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-bold border border-slate-700">
                {pkt.nodeId}
              </span>
              <span className="text-slate-400 text-[10px]">[{pkt.protocol}]</span>
              <span className="text-slate-500">{pkt.hexDump}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className={pkt.strainUe > 1150 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                {pkt.strainUe} µε
              </span>
              <span className="text-slate-400">{pkt.tempC}°C</span>
              <span className="text-slate-400">{pkt.rssi} dBm</span>
              <span className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                pkt.crc === 'OK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                CRC {pkt.crc}
              </span>

              <button
                onClick={() => copyPacket(pkt)}
                className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                title="Copy Packet JSON"
              >
                {copiedId === pkt.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
