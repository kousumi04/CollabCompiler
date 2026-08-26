import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Header } from './components/Header';
import { OutputConsole } from './components/OutputConsole';
import { RoomEntry } from './components/RoomEntry';
import { runCodeApi } from './services/api';
import { SUPPORTED_LANGUAGES } from './types/compiler';
import { useRoomStore } from './store/roomStore';
import { useWebSocket } from './hooks/useWebSocket';
import type { SupportedLanguage, ExecuteResponse } from './types/compiler';

function App() {
  const { roomId, username } = useRoomStore();
  
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(SUPPORTED_LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Callbacks for when we RECEIVE updates from the WebSocket
  const handleRemoteCodeUpdate = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleRemoteLanguageUpdate = useCallback((newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    const langOption = SUPPORTED_LANGUAGES.find(l => l.id === newLanguage);
    if (langOption) {
      // Small UX improvement: only overwrite code on language change if it's the default snippet
      setCode(prev => {
        const isCurrentDefault = SUPPORTED_LANGUAGES.some(l => l.defaultCode === prev);
        return isCurrentDefault ? langOption.defaultCode : prev;
      });
    }
  }, []);

  // Initialize WebSocket hook
  const { sendCodeUpdate, sendLanguageUpdate } = useWebSocket({
    roomId,
    username,
    onCodeUpdate: handleRemoteCodeUpdate,
    onLanguageUpdate: handleRemoteLanguageUpdate
  });

  // When USER changes language via dropdown
  const handleLocalLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    sendLanguageUpdate(newLanguage);
    
    const langOption = SUPPORTED_LANGUAGES.find(l => l.id === newLanguage);
    if (langOption) {
      setCode(langOption.defaultCode);
      sendCodeUpdate(langOption.defaultCode);
    }
  };

  // When USER types in Monaco
  const handleLocalCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    sendCodeUpdate(newCode);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const result = await runCodeApi(language, code);
      setOutput(result);
    } catch (error: any) {
      setOutput({
        stdout: '',
        stderr: error.message || 'An unknown error occurred.',
        status: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const currentLangOption = SUPPORTED_LANGUAGES.find(l => l.id === language);

  if (!roomId) {
    return <RoomEntry />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      <Header 
        isRunning={isRunning} 
        onLanguageChange={handleLocalLanguageChange} 
        onRunCode={handleRunCode} 
        selectedLanguage={language}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/3 h-full">
          <Editor 
            height="100%" 
            language={currentLangOption?.monacoLanguage || 'python'} 
            theme="vs-dark" 
            value={code} 
            onChange={handleLocalCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        
        <div className="w-1/3 h-full">
          <OutputConsole isRunning={isRunning} output={output} />
        </div>
      </div>
    </div>
  );
}

export default App;