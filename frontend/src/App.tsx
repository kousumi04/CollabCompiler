import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Header } from './components/Header';
import { OutputConsole } from './components/OutputConsole';
import { RoomEntry } from './components/roomEntry';
import { runCodeApi } from './services/api';
import { SUPPORTED_LANGUAGES } from './types/compiler';
import { useRoomStore } from './store/roomStore';
import type { SupportedLanguage, ExecuteResponse } from './types/compiler';

function App() {
  const { roomId, username } = useRoomStore();
  
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [code, setCode] = useState<string>(SUPPORTED_LANGUAGES[0].defaultCode);
  const [output, setOutput] = useState<ExecuteResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const langOption = SUPPORTED_LANGUAGES.find(l => l.id === language);
    if (langOption) {
      setCode(langOption.defaultCode);
    }
  }, [language]);

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

  // If no room is joined, show the Entry screen
  if (!roomId) {
    return <RoomEntry />;
  }

  // If room is joined, show the Editor
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      {/* We will update the Header later to show the Room ID */}
      <Header 
        isRunning={isRunning} 
        onLanguageChange={setLanguage} 
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
            onChange={(value) => setCode(value || '')}
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