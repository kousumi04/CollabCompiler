import type { SupportedLanguage } from './compiler';

export type WsMessageType = 
  | 'CODE_UPDATE'
  | 'LANGUAGE_UPDATE'
  | 'ROOM_STATE'
  | 'REQUEST_CONTROL'
  | 'CURSOR_UPDATE'
  | 'RUN_CODE'
  | 'RUN_STARTED'
  | 'RUN_RESULT'
  | 'SYNC_STATE'; // Added new type

export interface RoomStatePayload {
  owner: string;
  controller: string;
  status: 'WAITING' | 'ACTIVE';
  users: string[];
}

export interface CursorUpdatePayload {
  line: number;
  column: number;
}

export interface WsMessage {
  type: WsMessageType;
  client_id?: string;
  payload?: any;
}