import React, { useState } from 'react';
import { useRoomStore } from '../store/roomStore';
import { Code2, Users, Plus } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const RoomEntry: React.FC = () => {
  const [username, setUsername] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setRoom = useRoomStore((state) => state.setRoom);

  const handleCreateRoom = async () => {
    if (!username.trim()) return alert('Please enter a username');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms`, { method: 'POST' });
      const data = await response.json();
      setRoom(data.room_id, username);
    } catch (error) {
      console.error('Failed to create room:', error);
      alert('Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!username.trim()) return alert('Please enter a username');
    if (!joinRoomId.trim()) return alert('Please enter a Room ID');
    setRoom(joinRoomId, username);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Code2 className="w-12 h-12 text-indigo-400 mb-4" />
          <h1 className="text-2xl font-bold">CollabCompiler</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time code collaboration</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Your Name</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
            
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Room ID"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-center"
              />
              <button
                onClick={handleJoinRoom}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                Join Room
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};