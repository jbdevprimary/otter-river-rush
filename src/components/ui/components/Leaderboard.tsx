/**
 * Leaderboard Component - Cross-platform React Native/Web
 * Displays top 10 scores with highlighting for new entries
 * Uses NativeWind styling
 */

import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { getCharacter } from '../../../game/config';
import {
  formatDate,
  formatDistance,
  getLeaderboard,
  type LeaderboardEntry,
} from '../../../game/store';

interface LeaderboardProps {
  /** Rank of the newly added entry to highlight (1-10), or null if no new entry */
  highlightRank?: number | null;
}

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

  // Medal display for top 3
  const getMedal = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}`;
  };

  if (entries.length === 0) {
    return (
      <View className="w-full max-w-[380px] mt-5 mb-2.5">
        <Text className="text-brand-gold text-2xl font-bold text-center mb-3">LEADERBOARD</Text>
        <Text className="text-slate-500 text-center py-5 italic">
          No scores yet. Play to set a record!
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full max-w-[380px] mt-5 mb-2.5">
      <Text className="text-brand-gold text-2xl font-bold text-center mb-3">LEADERBOARD</Text>

      {/* Table Header */}
      <View className="flex-row border-b-2 border-slate-600 pb-2 mb-1">
        <Text className="text-slate-400 text-xs font-bold uppercase w-[30px] text-center">#</Text>
        <Text className="text-slate-400 text-xs font-bold uppercase w-[80px] text-right">
          Score
        </Text>
        <Text className="text-slate-400 text-xs font-bold uppercase w-[60px] text-right">Dist</Text>
        <Text className="text-slate-400 text-xs font-bold uppercase flex-1 pl-2">Character</Text>
        <Text className="text-slate-400 text-xs font-bold uppercase w-[80px] text-right">Date</Text>
      </View>

      {/* Table Rows */}
      {entries.map((entry) => {
        const isHighlighted = highlightRank === entry.rank;
        return (
          <View
            key={`${entry.date}-${entry.score}`}
            className={`flex-row py-2 border-b border-slate-700 ${
              isHighlighted ? 'bg-amber-400/20' : ''
            }`}
          >
            <Text className="text-slate-400 text-sm font-bold w-[30px] text-center">
              {getMedal(entry.rank)}
            </Text>
            <View className="w-[80px] flex-row justify-end items-center">
              <Text className="text-brand-gold text-sm font-bold text-right">
                {entry.score.toLocaleString()}
              </Text>
              {isHighlighted && (
                <View className="bg-brand-gold ml-1.5 px-1.5 py-0.5 rounded">
                  <Text className="text-brand-surface text-[10px] font-bold uppercase">NEW</Text>
                </View>
              )}
            </View>
            <Text className="text-brand-primary text-sm w-[60px] text-right">
              {formatDistance(entry.distance)}
            </Text>
            <Text className="text-slate-200 text-sm flex-1 pl-2" numberOfLines={1}>
              {getCharacterName(entry.characterId)}
            </Text>
            <Text className="text-slate-500 text-xs w-[80px] text-right">
              {formatDate(entry.date)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
