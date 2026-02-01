/**
 * useSession hook - Session state management
 *
 * Manages user session in sessionStorage
 */

import { useState, useEffect } from 'react';

interface SessionData {
  userId: string;
  roomCode: string;
  hostId?: string;
}

const SESSION_KEY = 'smallbets_session';

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(() => {
    // Initialize from sessionStorage
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Persist to sessionStorage when session changes
  useEffect(() => {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const saveSession = (data: SessionData) => {
    setSession(data);
  };

  const clearSession = () => {
    setSession(null);
  };

  const isHost = session?.hostId === session?.userId;

  return {
    session,
    saveSession,
    clearSession,
    isHost,
  };
}
