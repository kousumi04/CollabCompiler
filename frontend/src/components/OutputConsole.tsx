import React from 'react';
import { Terminal, Clock, Activity } from 'lucide-react';
import type { ExecuteResponse } from '../types/compiler';

interface OutputConsoleProps {
  output: ExecuteResponse | null;
  isRunning: boolean;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({ output, isRunning }) => {
  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-l border-slate-800 font-mono text-sm relative">
      <div className="bg-slate-900 text-slate-400 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          <span className="font-semibold text-xs tracking-wider uppercase">Output Console</span>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {isRunning ? (
          <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
            <span className="text-slate-500">$</span>
            Executing code in secure container...
          </div>
        ) : !output ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4">
            <Activity className="w-12 h-12 opacity-20" />
            <p>Awaiting execution...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="text-emerald-500 mt-0.5">$</span>
              <div className="flex-1 flex flex-col gap-2">
                {output.stdout && (
                  <pre className="text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {output.stdout}
                  </pre>
                )}
                {output.stderr && (
                  <pre className="text-red-400 whitespace-pre-wrap font-mono leading-relaxed bg-red-400/10 p-3 rounded-md border border-red-400/20">
                    {output.stderr}
                  </pre>
                )}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-6 text-xs text-slate-500 bg-slate-900/50 p-3 rounded-md">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Status:</span>
                <span className={output.exit_code === 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {output.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="font-medium">Exit Code:</span>
                <span className="text-slate-300">{output.exit_code}</span>
              </div>
              
              {output.execution_time !== undefined && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-slate-300">{output.execution_time}s</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};