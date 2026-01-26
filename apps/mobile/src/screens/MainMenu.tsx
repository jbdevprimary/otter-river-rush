/**
 * MainMenu - Main menu screen for mobile app
 *
 * Shows title, play button, and settings.
 */

import { useGameStore } from '@otter-river-rush/game-core/store';
import type { GameMode } from '@otter-river-rush/game-core/types';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function MainMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const progress = useGameStore((state) => state.progress);

  const handlePlay = (mode: GameMode = 'classic') => {
    startGame(mode);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleOtter}>OTTER</Text>
        <Text style={styles.titleRiver}>RIVER</Text>
        <Text style={styles.titleRush}>RUSH</Text>
      </View>

      {/* High Score Display */}
      {progress.highScore > 0 && (
        <View style={styles.highScoreContainer}>
          <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
          <Text style={styles.highScoreValue}>
            {progress.highScore.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Menu Buttons */}
      <View style={styles.menuButtons}>
        <Pressable
          style={[styles.button, styles.playButton]}
          onPress={() => handlePlay('classic')}
        >
          <Text style={styles.playButtonText}>PLAY</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => handlePlay('time_trial')}
        >
          <Text style={styles.secondaryButtonText}>TIME TRIAL</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => handlePlay('zen')}
        >
          <Text style={styles.secondaryButtonText}>ZEN MODE</Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.gamesPlayed}</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.floor(progress.totalDistance)}m
          </Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{progress.totalCoins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Swipe to move lanes</Text>
        <Text style={styles.footerText}>Collect coins, avoid obstacles!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleOtter: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 4,
  },
  titleRiver: {
    fontSize: 36,
    fontWeight: '600',
    color: '#4FC3F7',
    letterSpacing: 8,
    marginTop: -8,
  },
  titleRush: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 12,
    marginTop: -8,
  },
  highScoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  highScoreLabel: {
    fontSize: 14,
    color: '#aaaaaa',
    letterSpacing: 2,
  },
  highScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  menuButtons: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 48,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  playButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4FC3F7',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4FC3F7',
    letterSpacing: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
});
