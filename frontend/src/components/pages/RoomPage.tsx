/**
 * Room page - Main betting interface
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/hooks/useSession';
import { useRoom } from '@/hooks/useRoom';
import { useUser } from '@/hooks/useUser';
import { useBet } from '@/hooks/useBet';
import { useParticipants } from '@/hooks/useParticipants';

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { session } = useSession();
  const { room, loading: roomLoading } = useRoom(code || null);
  const { user, loading: userLoading } = useUser(session?.userId || null);
  const { bet, loading: betLoading } = useBet(room?.currentBetId || null);
  const { participants } = useParticipants(code || null);

  // Redirect if no session
  useEffect(() => {
    if (!session || session.roomCode !== code) {
      navigate(`/join/${code}`);
    }
  }, [session, code, navigate]);

  if (roomLoading || userLoading) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="spinner" />
        <p className="text-center text-muted">Loading room...</p>
      </div>
    );
  }

  if (!room || !user) {
    return (
      <div className="container" style={{ paddingTop: '3rem' }}>
        <div className="card">
          <p className="text-error">Room not found</p>
          <button
            className="btn btn-secondary mt-md"
            onClick={() => navigate('/')}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isHost = user.isAdmin;

  return (
    <div className="container-full" style={{ paddingTop: '1rem' }}>
      {/* Room Header */}
      <div className="card mb-md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ marginBottom: '0.25rem' }}>Room {room.code}</h3>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
              {room.status === 'waiting' && 'Waiting to start'}
              {room.status === 'active' && 'Event in progress'}
              {room.status === 'finished' && 'Event finished'}
            </p>
          </div>
          <div className="text-right">
            <p style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem' }}>
              {user.points}
            </p>
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
              points
            </p>
          </div>
        </div>
        {isHost && (
          <div className="mt-md" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
            <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 0 }}>
              You are the host
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      {room.status === 'waiting' && (
        <div className="card mb-md text-center">
          <h4 className="mb-md">Waiting for event to start</h4>
          <p className="text-secondary mb-md">
            {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
          </p>
          {isHost && (
            <button className="btn btn-primary">
              Start Event
            </button>
          )}
        </div>
      )}

      {room.status === 'active' && !bet && (
        <div className="card mb-md text-center">
          <p className="text-secondary">Waiting for next bet...</p>
        </div>
      )}

      {room.status === 'active' && bet && (
        <div className="card mb-md">
          <h3 className="mb-md">{bet.question}</h3>
          <p className="text-secondary mb-md" style={{ fontSize: '0.875rem' }}>
            Status: {bet.status}
          </p>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {bet.options.map((option) => (
              <button
                key={option}
                className="btn btn-secondary"
                style={{ textAlign: 'left', padding: '1rem' }}
                disabled={bet.status !== 'open'}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="card">
        <h4 className="mb-md">Participants ({participants.length})</h4>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {participants
            .sort((a, b) => b.points - a.points)
            .map((participant) => (
              <div
                key={participant.userId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span>
                  {participant.nickname}
                  {participant.isAdmin && (
                    <span className="text-muted" style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>
                      (Host)
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: '600' }}>{participant.points}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
