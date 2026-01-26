/**
 * GameOverScreen - Game over screen for mobile app
 *
 * Shows final score, stats, and options to play again or return to menu.
 */

import { useGameStore } from '@otter-river-rush/game-core/store';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function GameOverScreen() {
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const coins = useGameStore((state) => state.coins);
  const gems = useGameStore((state) => state.gems);
  const progress = useGameStore((state) => state.progress);
  const startGame = useGameStore((state) => state.startGame);
  const returnToMenu = useGameStore((state) => state.returnToMenu);

  const isNewHighScore = score >= progress.highScore && score > 0;

  const handlePlayAgain = () => {
    startGame('classic');
  };

  return (
    <View style={styles.container}>
      {/* Game Over Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.gameOverText}>GAME OVER</Text>
        {isNewHighScore && (
          <Text style={styles.newHighScore}>NEW HIGH SCORE!</Text>
        )}
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>SCORE</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.floor(distance)}m</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.coinValue]}>{coins}</Text>
          <Text style={styles.statLabel}>Coins</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, styles.gemValue]}>{gems}</Text>
          <Text style={styles.statLabel}>Gems</Text>
        </View>
      </View>

      {/* Progress Info */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>TOTAL PROGRESS</Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Games Played:</Text>
          <Text style={styles.progressValue}>{progress.gamesPlayed}</Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Total Distance:</Text>
          <Text style={styles.progressValue}>
            {Math.floor(progress.totalDistance)}m
          </Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Total Coins:</Text>
          <Text style={styles.progressValue}>{progress.totalCoins}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, styles.playAgainButton]}
          onPress={handlePlayAgain}
        >
          <Text style={styles.playAgainButtonText}>PLAY AGAIN</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.menuButton]}
          onPress={returnToMenu}
        >
          <Text style={styles.menuButtonText}>MAIN MENU</Text>
        </Pressable>
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
    marginBottom: 24,
  },
  gameOverText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
    letterSpacing: 4,
  },
  newHighScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#888888',
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 320,
    marginBottom: 32,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 12,
    minWidth: 90,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coinValue: {
    color: '#FFD700',
  },
  gemValue: {
    color: '#9C27B0',
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
    marginBottom: 32,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4FC3F7',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#888888',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 280,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  playAgainButton: {
    backgroundColor: '#4CAF50',
  },
  playAgainButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  menuButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#888888',
  },
  menuButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888888',
    letterSpacing: 2,
  },
});
