/**
 * Admin Panel - Admin controls and monitoring
 */

import { useState } from 'react';
import LiveFeedPanel from './LiveFeedPanel';
import { roomApi, betApi } from '@/services/api';
import type { Room, Bet } from '@/types';

interface AdminPanelProps {
  room: Room;
  hostId: string;
  currentBet: Bet | null;
  onRoomUpdate: (room: Room) => void;
}

export default function AdminPanel({
  room,
  hostId,
  currentBet,
  onRoomUpdate,
}: AdminPanelProps) {
  const [automationEnabled, setAutomationEnabled] = useState(room.automationEnabled);

  const handleToggleAutomation = (enabled: boolean) => {
    setAutomationEnabled(enabled);
    onRoomUpdate({ ...room, automationEnabled: enabled });
  };

  const handleStartRoom = async () => {
    try {
      await roomApi.startRoom(room.code, hostId);
      onRoomUpdate({ ...room, status: 'active' });
    } catch (err) {
      console.error('Failed to start room:', err);
    }
  };

  const handleFinishRoom = async () => {
    try {
      await roomApi.finishRoom(room.code, hostId);
      onRoomUpdate({ ...room, status: 'finished' });
    } catch (err) {
      console.error('Failed to finish room:', err);
    }
  };

  const handleLockBet = async () => {
    if (!currentBet) return;

    try {
      await betApi.lockBet(room.code, hostId);
    } catch (err) {
      console.error('Failed to lock bet:', err);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
      {/* Room Controls */}
      <div className="card">
        <h4 className="mb-md">Room Controls</h4>

        <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
          {room.status === 'waiting' && (
            <button className="btn btn-primary" onClick={handleStartRoom}>
              Start Event
            </button>
          )}

          {room.status === 'active' && (
            <>
              {currentBet && currentBet.status === 'open' && (
                <button className="btn btn-secondary" onClick={handleLockBet}>
                  Close Betting
                </button>
              )}
              <button className="btn btn-secondary" onClick={handleFinishRoom}>
                Finish Event
              </button>
            </>
          )}

          {room.status === 'finished' && (
            <p className="text-secondary" style={{ marginBottom: 0 }}>
              Event finished
            </p>
          )}
        </div>
      </div>

      {/* Live Feed Panel (only show when event is active) */}
      {room.status === 'active' && (
        <LiveFeedPanel
          roomCode={room.code}
          hostId={hostId}
          automationEnabled={automationEnabled}
          onToggleAutomation={handleToggleAutomation}
        />
      )}

      {/* Current Bet Info */}
      {currentBet && (
        <div className="card">
          <h4 className="mb-md">Current Bet</h4>
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>
            <strong>Question:</strong> {currentBet.question}
          </p>
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>
            <strong>Status:</strong>{' '}
            <span
              style={{
                color:
                  currentBet.status === 'open'
                    ? 'var(--color-success)'
                    : 'var(--color-text-secondary)',
              }}
            >
              {currentBet.status}
            </span>
          </p>
          <p style={{ marginBottom: 0 }}>
            <strong>Options:</strong> {currentBet.options.length}
          </p>
        </div>
      )}
    </div>
  );
}
