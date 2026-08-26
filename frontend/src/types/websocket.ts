import { SupportedLanguage } from './compiler';

export type WsMessageType = 
  | 'CODE_UPDATE'
  | 'LANGUAGE_UPDATE'
  | 'USER_JOINED'
  | 'USER_LEFT';

export interface WsMessage {
  type: WsMessageType;
  client_id?: string;
  payload?: any;
}

export interface CodeUpdatePayload {
  code: string;
}

export interface LanguageUpdatePayload {
  language: SupportedLanguage;
}