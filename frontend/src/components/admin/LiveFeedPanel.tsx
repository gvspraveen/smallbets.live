/**
 * Live Feed Panel - Admin interface for manual transcript input
 *
 * Allows admin to input key moments in real-time during live events
 */

import { useState } from 'react';
import { roomApi } from '@/services/api';

interface LiveFeedPanelProps {
  roomCode: string;
  hostId: string;
  automationEnabled: boolean;
  onToggleAutomation: (enabled: boolean) => void;
}

export default function LiveFeedPanel({
  roomCode,
  hostId,
  automationEnabled,
  onToggleAutomation,
}: LiveFeedPanelProps) {
  const [transcriptText, setTranscriptText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transcriptText.trim()) {
      setError('Please enter some text');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Send transcript to API
      const response = await fetch(`/api/rooms/${roomCode}/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcriptText,
          source: 'manual',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit transcript');
      }

      const result = await response.json();
      setLastResult(result);

      // Clear input after successful submit
      setTranscriptText('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit transcript');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAutomation = async () => {
    try {
      await fetch(`/api/rooms/${roomCode}/automation/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Host-Id': hostId,
        },
        body: JSON.stringify({
          enabled: !automationEnabled,
        }),
      });

      onToggleAutomation(!automationEnabled);
    } catch (err) {
      setError('Failed to toggle automation');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <h4 style={{ marginBottom: 0 }}>Live Transcript Feed</h4>
        <button
          className={`btn ${automationEnabled ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleToggleAutomation}
          style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}
        >
          {automationEnabled ? 'Auto: ON' : 'Auto: OFF'}
        </button>
      </div>

      <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
        Type key moments as they happen on TV. Automation will trigger bet actions if patterns match.
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={transcriptText}
          onChange={(e) => setTranscriptText(e.target.value)}
          placeholder='e.g., "And the Grammy goes to... Beyoncé!"'
          rows={3}
          style={{ marginBottom: 'var(--spacing-md)', resize: 'vertical' }}
          disabled={submitting}
        />

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={submitting || !transcriptText.trim()}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {error && (
        <div
          className="mt-md"
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-bg-elevated)',
            borderLeft: '3px solid var(--color-error)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <p className="text-error" style={{ marginBottom: 0, fontSize: 'var(--font-size-sm)' }}>
            {error}
          </p>
        </div>
      )}

      {lastResult && (
        <div
          className="mt-md"
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-bg-elevated)',
            borderLeft: `3px solid ${
              lastResult.automation.action_taken === 'ignored'
                ? 'var(--color-text-muted)'
                : 'var(--color-success)'
            }`,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-sm)' }}>
            <p style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Action:</strong>{' '}
              <span
                style={{
                  color:
                    lastResult.automation.action_taken === 'open_bet'
                      ? 'var(--color-success)'
                      : lastResult.automation.action_taken === 'resolve_bet'
                      ? 'var(--color-success)'
                      : 'var(--color-text-muted)',
                }}
              >
                {lastResult.automation.action_taken}
              </span>
            </p>

            {lastResult.automation.confidence > 0 && (
              <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong>Confidence:</strong>{' '}
                {(lastResult.automation.confidence * 100).toFixed(0)}%
              </p>
            )}

            {lastResult.automation.details && (
              <p style={{ marginBottom: 0, color: 'var(--color-text-secondary)' }}>
                {lastResult.automation.details.reason ||
                  lastResult.automation.details.trigger_type}
              </p>
            )}

            {lastResult.automation.details?.winner && (
              <p style={{ marginTop: 'var(--spacing-sm)', marginBottom: 0 }}>
                <strong>Winner:</strong> {lastResult.automation.details.winner}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-lg" style={{ paddingTop: 'var(--spacing-md)', borderTop: '1px solid var(--color-border)' }}>
        <h5 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-sm)' }}>
          Quick Examples:
        </h5>
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          <p style={{ marginBottom: 'var(--spacing-xs)' }}>
            • "Next category: Album of the Year"
          </p>
          <p style={{ marginBottom: 'var(--spacing-xs)' }}>
            • "And the Grammy goes to... Taylor Swift!"
          </p>
          <p style={{ marginBottom: 0 }}>
            • "The winner is Oppenheimer"
          </p>
        </div>
      </div>
    </div>
  );
}
