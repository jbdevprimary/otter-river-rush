/**
 * Leaderboard Component
 * Displays top 10 scores with highlighting for new entries
 */

import { getCharacter, UI_COLORS } from '@otter-river-rush/config';
import {
  formatDate,
  formatDistance,
  getLeaderboard,
  type LeaderboardEntry,
} from '@otter-river-rush/state';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

interface LeaderboardProps {
  /** Rank of the newly added entry to highlight (1-10), or null if no new entry */
  highlightRank?: number | null;
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '380px',
    marginTop: '20px',
    marginBottom: '10px',
  } satisfies CSSProperties,

  title: {
    color: UI_COLORS.combo,
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 0,
    marginBottom: '12px',
    textShadow: `0 0 10px ${UI_COLORS.combo}`,
  } satisfies CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  } satisfies CSSProperties,

  headerRow: {
    borderBottom: '2px solid #475569',
  } satisfies CSSProperties,

  headerCell: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    padding: '8px 4px',
    textAlign: 'left',
  } satisfies CSSProperties,

  row: {
    borderBottom: '1px solid #334155',
    transition: 'background-color 0.2s ease',
  } satisfies CSSProperties,

  highlightedRow: {
    borderBottom: '1px solid #334155',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    animation: 'pulse 2s ease-in-out infinite',
  } satisfies CSSProperties,

  cell: {
    color: '#e2e8f0',
    padding: '8px 4px',
    verticalAlign: 'middle',
  } satisfies CSSProperties,

  rankCell: {
    color: '#94a3b8',
    fontWeight: 'bold',
    width: '30px',
    textAlign: 'center',
  } satisfies CSSProperties,

  scoreCell: {
    color: UI_COLORS.combo,
    fontWeight: 'bold',
    textAlign: 'right',
    width: '80px',
  } satisfies CSSProperties,

  distanceCell: {
    color: UI_COLORS.distance,
    textAlign: 'right',
    width: '60px',
  } satisfies CSSProperties,

  characterCell: {
    color: '#e2e8f0',
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  dateCell: {
    color: '#64748b',
    fontSize: '11px',
    textAlign: 'right',
    width: '80px',
  } satisfies CSSProperties,

  emptyState: {
    color: '#64748b',
    textAlign: 'center',
    padding: '20px',
    fontStyle: 'italic',
  } satisfies CSSProperties,

  newBadge: {
    backgroundColor: UI_COLORS.combo,
    color: '#1e293b',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px',
    marginLeft: '6px',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
};

// CSS keyframes animation for pulse effect
const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { background-color: rgba(251, 191, 36, 0.1); }
    50% { background-color: rgba(251, 191, 36, 0.25); }
  }
`;

export function Leaderboard({ highlightRank }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  // Get character name from ID
  const getCharacterName = (characterId: string): string => {
    const character = getCharacter(characterId);
    return character?.name ?? characterId;
  };

  // Medal emoji for top 3
  const getMedal = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}`;
  };

  if (entries.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>LEADERBOARD</h3>
        <p style={styles.emptyState}>No scores yet. Play to set a record!</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Inject animation keyframes */}
      <style>{pulseKeyframes}</style>

      <h3 style={styles.title}>LEADERBOARD</h3>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={{ ...styles.headerCell, textAlign: 'center', width: '30px' }}>#</th>
            <th style={{ ...styles.headerCell, textAlign: 'right', width: '80px' }}>Score</th>
            <th style={{ ...styles.headerCell, textAlign: 'right', width: '60px' }}>Dist</th>
            <th style={styles.headerCell}>Character</th>
            <th style={{ ...styles.headerCell, textAlign: 'right', width: '80px' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isHighlighted = highlightRank === entry.rank;
            return (
              <tr
                key={`${entry.date}-${entry.score}`}
                style={isHighlighted ? styles.highlightedRow : styles.row}
              >
                <td style={{ ...styles.cell, ...styles.rankCell }}>{getMedal(entry.rank)}</td>
                <td style={{ ...styles.cell, ...styles.scoreCell }}>
                  {entry.score.toLocaleString()}
                  {isHighlighted && <span style={styles.newBadge}>NEW</span>}
                </td>
                <td style={{ ...styles.cell, ...styles.distanceCell }}>
                  {formatDistance(entry.distance)}
                </td>
                <td style={{ ...styles.cell, ...styles.characterCell }}>
                  {getCharacterName(entry.characterId)}
                </td>
                <td style={{ ...styles.cell, ...styles.dateCell }}>{formatDate(entry.date)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
