import React from 'react';
import type { ExecuteResponse } from '../types/compiler';

interface OutputConsoleProps {
  output: ExecuteResponse | null;
  isRunning: boolean;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({ output, isRunning }) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-slate-800 font-mono text-sm">
      <div className="bg-slate-900 text-slate-400 px-4 py-2 border-b border-slate-800 flex justify-between items-center shrink-0">
        <span>Output Console</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {isRunning ? (
          <div className="text-slate-500 animate-pulse">Executing code...</div>
        ) : !output ? (
          <div className="text-slate-500">Run code to see output here.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {output.stdout && (
              <pre className="text-slate-300 whitespace-pre-wrap">{output.stdout}</pre>
            )}
            {output.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
            )}
            
            <div className="mt-4 pt-4 border-t border-slate-800 flex gap-4 text-xs text-slate-500">
              <span>Status: <span className={output.exit_code === 0 ? 'text-emerald-400' : 'text-red-400'}>{output.status}</span></span>
              <span>Exit Code: {output.exit_code}</span>
              {output.execution_time !== undefined && (
                <span>Time: {output.execution_time}s</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};