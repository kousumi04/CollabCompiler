import React from 'react';
import { Play, Loader2, Code2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types/compiler';
import type { SupportedLanguage } from '../types/compiler';

interface HeaderProps {
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onRunCode: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedLanguage,
  onLanguageChange,
  onRunCode,
  isRunning
}) => {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 text-white shrink-0">
      <div className="flex items-center gap-2">
        <Code2 className="w-6 h-6 text-indigo-400"/>
        <span className="font-bold text-lg tracking-wide">CollabCompiler</span>
      </div>
      
      <div className="flex items-center gap-4">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-slate-800 border border-slate-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin"/>
          ) : (
            <Play className="w-4 h-4"/>
          )}
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      </div>
    </header>
  );
};