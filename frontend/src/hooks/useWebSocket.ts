import { useEffect, useRef, useCallback, useState } from 'react';
import type { WsMessage, RoomStatePayload, CursorUpdatePayload } from '../types/websocket';
import type { SupportedLanguage, ExecuteResponse } from '../types/compiler';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

interface UseWebSocketProps {
  roomId: string | null;
  username: string;
  onCodeUpdate: (code: string) => void;
  onLanguageUpdate: (language: SupportedLanguage) => void;
  onCursorUpdate: (clientId: string, cursor: CursorUpdatePayload) => void;
  onRunStarted: () => void;
  onRunResult: (result: ExecuteResponse) => void;
  onSyncState: (code: string, language: SupportedLanguage) => void;
}

export const useWebSocket = ({ 
  roomId, 
  username, 
  onCodeUpdate, 
  onLanguageUpdate, 
  onCursorUpdate,
  onRunStarted,
  onRunResult,
  onSyncState
}: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const [roomState, setRoomState] = useState<RoomStatePayload | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');

  useEffect(() => {
    if (!roomId || !username) return;

    setStatus('CONNECTING');
    const wsUrl = `${WS_BASE_URL}/ws/${roomId}/${encodeURIComponent(username)}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setStatus('CONNECTED');
    };

    ws.current.onclose = () => {
      setStatus('DISCONNECTED');
    };

    ws.current.onerror = () => {
      setStatus('DISCONNECTED');
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'ROOM_STATE':
            setRoomState(message.payload);
            break;
          case 'CODE_UPDATE':
            if (message.payload?.code !== undefined) onCodeUpdate(message.payload.code);
            break;
          case 'LANGUAGE_UPDATE':
            if (message.payload?.language) onLanguageUpdate(message.payload.language);
            break;
          case 'CURSOR_UPDATE':
            if (message.client_id && message.payload) onCursorUpdate(message.client_id, message.payload);
            break;
          case 'RUN_STARTED':
            onRunStarted();
            break;
          case 'RUN_RESULT':
            if (message.payload) onRunResult(message.payload);
            break;
          case 'SYNC_STATE':
            if (message.payload) onSyncState(message.payload.code, message.payload.language);
            break;
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [roomId, username, onCodeUpdate, onLanguageUpdate, onCursorUpdate, onRunStarted, onRunResult, onSyncState]);

  const sendCodeUpdate = useCallback((code: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'CODE_UPDATE', payload: { code } }));
    }
  }, []);

  const sendLanguageUpdate = useCallback((language: SupportedLanguage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'LANGUAGE_UPDATE', payload: { language } }));
    }
  }, []);

  const sendCursorUpdate = useCallback((line: number, column: number) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'CURSOR_UPDATE', payload: { line, column } }));
    }
  }, []);

  const requestControl = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'REQUEST_CONTROL' }));
    }
  }, []);

  const sendRunCode = useCallback((language: SupportedLanguage, code: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'RUN_CODE', payload: { language, code } }));
    }
  }, []);

  return {
    roomState,
    status,
    sendCodeUpdate,
    sendLanguageUpdate,
    sendCursorUpdate,
    requestControl,
    sendRunCode
  };
};