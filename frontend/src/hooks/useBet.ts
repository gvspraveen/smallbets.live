/**
 * useBet hook - Real-time bet data synchronization
 *
 * IMPERATIVE SHELL: Manages Firestore listener lifecycle
 */

import { useState, useEffect } from 'react';
import { subscribeToBet } from '@/services/firestore';
import type { Bet } from '@/types';

export function useBet(betId: string | null) {
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!betId) {
      setBet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to bet updates (I/O)
    const unsubscribe = subscribeToBet(betId, (updatedBet) => {
      setBet(updatedBet);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [betId]);

  return { bet, loading, error };
}
