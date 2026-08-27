import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { Header } from './components/Header';
import { OutputConsole } from './components/OutputConsole';
import { RoomEntry } from './components/RoomEntry';
import { SUPPORTED_LANGUAGES } from './types/compiler';
import { useRoomStore } from './store/roomStore';
import { useWebSocket } from './hooks/useWebSocket';
import type { SupportedLanguage, ExecuteResponse } from './types/compiler';
import type { CursorUpdatePayload, RoomStatePayload } from './types/websocket';

function App() {
  const { roomId, username } = useRoomStore();
  
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(SUPPORTED_LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const cursorDecorationsRef = useRef<any>([]);
  const roomStateRef = useRef<RoomStatePayload | null>(null);

  const handleRemoteCodeUpdate = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleRemoteLanguageUpdate = useCallback((newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
  }, []);

  const handleRemoteCursorUpdate = useCallback((clientId: string, cursor: CursorUpdatePayload) => {
    if (!editorRef.current || !monacoRef.current || !roomStateRef.current) return;

    const isLeader = clientId === roomStateRef.current.owner;
    const className = isLeader ? 'remote-cursor-leader' : 'remote-cursor-member';

    cursorDecorationsRef.current = editorRef.current.deltaDecorations(
      cursorDecorationsRef.current,
      [
        {
          range: new monacoRef.current.Range(cursor.line, cursor.column, cursor.line, cursor.column),
          options: { className: className }
        }
      ]
    );
  }, []);

  const handleRunStarted = useCallback(() => {
    setIsRunning(true);
    setOutput(null);
  }, []);

  const handleRunResult = useCallback((result: ExecuteResponse) => {
    setOutput(result);
    setIsRunning(false);
  }, []);

  // NEW: Handle synchronization on connect/reconnect
  const handleSyncState = useCallback((syncCode: string, syncLanguage: SupportedLanguage) => {
    setLanguage(syncLanguage);
    setCode(syncCode);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setIsRunning(false);
    setOutput({
      stdout: '',
      stderr: `[SERVER REJECTED REQUEST]\n${errorMessage}`,
      exit_code: 1,
      status: 'security_blocked'
    });
  }, []);

  const { 
    roomState, 
    status,
    sendCodeUpdate, 
    sendLanguageUpdate, 
    sendCursorUpdate, 
    requestControl,
    sendRunCode
  } = useWebSocket({
    roomId,
    username,
    onCodeUpdate: handleRemoteCodeUpdate,
    onLanguageUpdate: handleRemoteLanguageUpdate,
    onCursorUpdate: handleRemoteCursorUpdate,
    onRunStarted: handleRunStarted,
    onRunResult: handleRunResult,
    onSyncState: handleSyncState,
    onError: handleError
  });

  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  // Push initial code to cache if we are the room creator and it's active
  useEffect(() => {
    if (roomState && roomState.owner === username && roomState.status === 'WAITING') {
      sendLanguageUpdate(language);
      sendCodeUpdate(code);
    }
  }, [roomState?.status]); // Only run when status initializes

  const isWaiting = roomState?.status === 'WAITING';
  const hasControl = roomState?.controller === username;
  const readOnly = isWaiting || !hasControl;

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    editor.onDidChangeCursorPosition((e: any) => {
      sendCursorUpdate(e.position.lineNumber, e.position.column);
    });

    editor.onKeyDown(() => {
      if (roomStateRef.current?.status === 'WAITING') return;
      if (!hasControl) {
        requestControl();
      }
    });
  };

  const handleLocalLanguageChange = (newLanguage: SupportedLanguage) => {
    if (readOnly) return;
    setLanguage(newLanguage);
    sendLanguageUpdate(newLanguage);
    
    const langOption = SUPPORTED_LANGUAGES.find(l => l.id === newLanguage);
    if (langOption) {
      setCode(langOption.defaultCode);
      sendCodeUpdate(langOption.defaultCode);
    }
  };

  const handleLocalCodeChange = (value: string | undefined) => {
    if (readOnly) return;
    const newCode = value || '';
    setCode(newCode);
    sendCodeUpdate(newCode);
  };

  const handleRunCode = () => {
    if (readOnly) return;
    sendRunCode(language, code);
  };

  const currentLangOption = SUPPORTED_LANGUAGES.find(l => l.id === language);

  if (!roomId) return <RoomEntry />;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      <Header 
        isRunning={isRunning} 
        onLanguageChange={handleLocalLanguageChange} 
        onRunCode={handleRunCode} 
        selectedLanguage={language}
        connectionStatus={status} // <-- ADD THIS
      />
      
      <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6 text-xs shrink-0">
        <div className="flex gap-4">
          <span className={isWaiting ? "text-amber-400" : "text-emerald-400"}>
            Status: {isWaiting ? "Waiting for Player 2..." : "Active"}
          </span>
          {roomState && (
            <span className="text-slate-400">
              Leader: <span className="text-amber-400">{roomState.owner}</span>
            </span>
          )}
        </div>
        <div>
          {roomState && (
            <span className={hasControl ? "text-emerald-400 font-bold" : "text-slate-500"}>
              Controller: {roomState.controller} {hasControl ? "(You)" : ""}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-2/3 h-full relative">
          {isWaiting && (
            <div className="absolute inset-0 z-50 bg-slate-900/50 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-800 px-6 py-3 rounded-full border border-slate-700 text-slate-300 font-medium">
                Waiting for someone to join...
              </div>
            </div>
          )}
          
          <Editor 
            height="100%" 
            language={currentLangOption?.monacoLanguage || 'python'} 
            theme="vs-dark" 
            value={code} 
            onChange={handleLocalCodeChange}
            onMount={handleEditorMount}
            options={{
              readOnly: readOnly,
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