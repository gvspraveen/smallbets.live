/**
 * useParticipants hook - Real-time participants synchronization
 *
 * IMPERATIVE SHELL: Manages Firestore listener lifecycle
 */

import { useState, useEffect } from 'react';
import { subscribeToParticipants } from '@/services/firestore';
import type { User } from '@/types';

export function useParticipants(roomCode: string | null) {
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setParticipants([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to participants updates (I/O)
    const unsubscribe = subscribeToParticipants(roomCode, (updatedParticipants) => {
      setParticipants(updatedParticipants);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [roomCode]);

  return { participants, loading, error };
}
