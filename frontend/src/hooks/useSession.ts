/**
 * useSession hook - Session state management
 *
 * Manages user sessions in sessionStorage.
 * Supports multiple rooms: sessions are stored per room code so users
 * can navigate between tournament and match rooms without losing state.
 */

import { useState, useEffect, useCallback } from 'react';

interface SessionData {
  userId: string;
  roomCode: string;
  hostId?: string;
  nickname?: string;
}

const SESSION_KEY = 'smallbets_session';
const ALL_SESSIONS_KEY = 'smallbets_sessions';

function loadAllSessions(): Record<string, SessionData> {
  const stored = sessionStorage.getItem(ALL_SESSIONS_KEY);
  if (stored) return JSON.parse(stored);
  // Migrate from old single-session format
  const old = sessionStorage.getItem(SESSION_KEY);
  if (old) {
    const s = JSON.parse(old);
    return { [s.roomCode]: s };
  }
  return {};
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Persist to sessionStorage when session changes
  useEffect(() => {
    if (session) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      // Also persist to per-room map
      const all = loadAllSessions();
      all[session.roomCode] = session;
      sessionStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const saveSession = (data: SessionData) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    const all = loadAllSessions();
    all[data.roomCode] = data;
    sessionStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(all));
    setSession(data);
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  };

  const getSessionForRoom = useCallback((roomCode: string): SessionData | null => {
    const all = loadAllSessions();
    return all[roomCode] ?? null;
  }, []);

  const switchToRoom = useCallback((roomCode: string): boolean => {
    const roomSession = loadAllSessions()[roomCode];
    if (roomSession) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(roomSession));
      setSession(roomSession);
      return true;
    }
    return false;
  }, []);

  const isHost = !!(session && session.hostId && session.hostId === session.userId);

  return {
    session,
    saveSession,
    clearSession,
    getSessionForRoom,
    switchToRoom,
    isHost,
  };
}
