import { useEffect, useRef, useCallback } from 'react';
import type { WsMessage, WsMessageType, CodeUpdatePayload, LanguageUpdatePayload } from '../types/websocket';
import type { SupportedLanguage } from '../types/compiler';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

interface UseWebSocketProps {
  roomId: string | null;
  username: string;
  onCodeUpdate: (code: string) => void;
  onLanguageUpdate: (language: SupportedLanguage) => void;
}

export const useWebSocket = ({ roomId, username, onCodeUpdate, onLanguageUpdate }: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId || !username) return;

    // Connect to WebSocket using username as a simple client_id for now
    const wsUrl = `${WS_BASE_URL}/ws/${roomId}/${encodeURIComponent(username)}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('Connected to room:', roomId);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WsMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'CODE_UPDATE':
            if (message.payload?.code !== undefined) {
              onCodeUpdate(message.payload.code);
            }
            break;
          case 'LANGUAGE_UPDATE':
            if (message.payload?.language) {
              onLanguageUpdate(message.payload.language);
            }
            break;
          case 'USER_JOINED':
            console.log(`${message.client_id} joined the room`);
            break;
          case 'USER_LEFT':
            console.log(`${message.client_id} left the room`);
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
  }, [roomId, username, onCodeUpdate, onLanguageUpdate]);

  const sendCodeUpdate = useCallback((code: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'CODE_UPDATE',
        payload: { code } as CodeUpdatePayload
      }));
    }
  }, []);

  const sendLanguageUpdate = useCallback((language: SupportedLanguage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'LANGUAGE_UPDATE',
        payload: { language } as LanguageUpdatePayload
      }));
    }
  }, []);

  return {
    sendCodeUpdate,
    sendLanguageUpdate
  };
};