/**
 * useRoom hook - Real-time room data synchronization
 *
 * IMPERATIVE SHELL: Manages Firestore listener lifecycle
 */

import { useState, useEffect, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { subscribeToRoom, parseRoomDoc } from '@/services/firestore';
import type { Room } from '@/types';

export function useRoom(roomCode: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasReceivedData = useRef(false);

  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    hasReceivedData.current = false;

    let graceTimeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    // Subscribe to room updates (I/O)
    const unsubscribe = subscribeToRoom(roomCode, (updatedRoom) => {
      if (cancelled) return;
      if (updatedRoom) {
        hasReceivedData.current = true;
        if (graceTimeout) {
          clearTimeout(graceTimeout);
          graceTimeout = null;
        }
        setRoom(updatedRoom);
        setLoading(false);
      } else if (hasReceivedData.current) {
        // Room was deleted after we already had data
        setRoom(null);
        setLoading(false);
      } else {
        // First snapshot returned null — room may not have synced yet
        // (e.g., navigating right after room creation).
        // Wait a grace period, then verify via one-time Firestore read
        // before showing "not found".
        if (!graceTimeout) {
          graceTimeout = setTimeout(async () => {
            if (cancelled || hasReceivedData.current) {
              graceTimeout = null;
              return;
            }
            // One-time read to definitively check if room exists
            try {
              const snapshot = await getDoc(doc(db, 'rooms', roomCode));
              if (cancelled || hasReceivedData.current) return;
              if (snapshot.exists()) {
                hasReceivedData.current = true;
                setRoom(parseRoomDoc(snapshot.data()));
              } else {
                setRoom(null);
              }
            } catch {
              if (cancelled || hasReceivedData.current) return;
              setRoom(null);
            }
            setLoading(false);
            graceTimeout = null;
          }, 2000);
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      cancelled = true;
      unsubscribe();
      if (graceTimeout) {
        clearTimeout(graceTimeout);
      }
    };
  }, [roomCode]);

  return { room, loading, error };
}
