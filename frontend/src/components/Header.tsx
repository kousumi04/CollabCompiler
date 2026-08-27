import React, { useState } from 'react';
import { Play, Loader2, Code2, Copy, Check, LogOut, Wifi } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types/compiler';
import type { SupportedLanguage } from '../types/compiler';
import { useRoomStore } from '../store/roomStore';
import type { ConnectionStatus } from '../hooks/useWebSocket';

interface HeaderProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onRunCode: () => void;
  isRunning: boolean;
  connectionStatus: ConnectionStatus;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onLanguageChange,
  onRunCode,
  isRunning,
  connectionStatus
}) => {
  const { roomId, leaveRoom } = useRoomStore();
  const [copied, setCopied] = useState(false);

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = () => {
    if (connectionStatus === 'CONNECTED') return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    if (connectionStatus === 'CONNECTING') return 'bg-amber-500 animate-pulse';
    return 'bg-red-500';
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 text-white shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-indigo-400"/>
          <span className="font-bold text-lg tracking-wide">CollabCompiler</span>
        </div>
        
        {roomId && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-md text-sm border border-slate-700">
              <span className="text-slate-400">Room:</span>
              <span className="font-mono text-indigo-300 font-medium">{roomId}</span>
              <button 
                onClick={handleCopyRoomId} 
                className="hover:text-indigo-400 text-slate-400 transition-colors ml-1" 
                title="Copy Room ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              {connectionStatus === 'DISCONNECTED' && <span>Offline</span>}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={onRunCode}
          disabled={isRunning || connectionStatus !== 'CONNECTED'}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4"/>}
          {isRunning ? 'Running...' : 'Run Code'}
        </button>

        <div className="w-px h-6 bg-slate-700 mx-1"></div>

        <button 
          onClick={leaveRoom} 
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium" 
          title="Leave Room"
        >
          <LogOut className="w-4 h-4" />
          Leave
        </button>
      </div>
    </header>
  );
};