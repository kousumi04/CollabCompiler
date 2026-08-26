import { create } from 'zustand';

interface RoomState {
  roomId: string | null;
  username: string;
  setRoom: (roomId: string, username: string) => void;
  leaveRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  username: '',
  setRoom: (roomId, username) => set({ roomId, username }),
  leaveRoom: () => set({ roomId: null, username: '' }),
}));