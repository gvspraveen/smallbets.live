/**
 * useRoom hook - Real-time room data synchronization
 *
 * IMPERATIVE SHELL: Manages Firestore listener lifecycle
 */

import { useState, useEffect } from 'react';
import { subscribeToRoom } from '@/services/firestore';
import type { Room } from '@/types';

export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to room updates (I/O)
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      setRoom(updatedRoom);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [roomCode]);

  return { room, loading, error };
}
