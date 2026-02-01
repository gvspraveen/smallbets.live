/**
 * useUser hook - Real-time user data synchronization
 *
 * IMPERATIVE SHELL: Manages Firestore listener lifecycle
 */

import { useState, useEffect } from 'react';
import { subscribeToUser } from '@/services/firestore';
import type { User } from '@/types';

export function useUser(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to user updates (I/O)
    const unsubscribe = subscribeToUser(userId, (updatedUser) => {
      setUser(updatedUser);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { user, loading, error };
}
