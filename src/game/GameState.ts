/**
 * Game state management
 */

import type { GameState as GameStateEnum } from '@/types/Game.types';

export class GameStateManager {
  private currentState: GameStateEnum;
  private previousState: GameStateEnum | null = null;
  private stateStartTime: number = 0;
  private listeners: Map<GameStateEnum, Set<() => void>> = new Map();
  private globalListeners: Set<
    (state: GameStateEnum, previous: GameStateEnum | null) => void
  > = new Set();

  constructor(initialState: GameStateEnum) {
    this.currentState = initialState;
    this.stateStartTime = Date.now();
  }

  /**
   * Get the current game state
   */
  public getState(): GameStateEnum {
    return this.currentState;
  }

  /**
   * Get the previous game state
   */
  public getPreviousState(): GameStateEnum | null {
    return this.previousState;
  }

  /**
   * Get time spent in current state (ms)
   */
  public getStateTime(): number {
    return Date.now() - this.stateStartTime;
  }

  /**
   * Change the current game state
   */
  public setState(newState: GameStateEnum): void {
    if (newState === this.currentState) {
      return;
    }

    const oldState = this.currentState;
    this.previousState = oldState;
    this.currentState = newState;
    this.stateStartTime = Date.now();

    // Notify state-specific listeners
    const listeners = this.listeners.get(newState);
    if (listeners) {
      listeners.forEach((callback) => callback());
    }

    // Notify global listeners
    this.globalListeners.forEach((callback) => callback(newState, oldState));
  }

  /**
   * Check if in a specific state
   */
  public is(state: GameStateEnum): boolean {
    return this.currentState === state;
  }

  /**
   * Check if in any of the given states
   */
  public isAnyOf(...states: GameStateEnum[]): boolean {
    return states.includes(this.currentState);
  }

  /**
   * Add a listener for a specific state
   */
  public onStateEnter(state: GameStateEnum, callback: () => void): () => void {
    if (!this.listeners.has(state)) {
      this.listeners.set(state, new Set());
    }
    this.listeners.get(state)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(state)?.delete(callback);
    };
  }

  /**
   * Add a global state change listener
   */
  public onStateChange(
    callback: (state: GameStateEnum, previous: GameStateEnum | null) => void
  ): () => void {
    this.globalListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.globalListeners.delete(callback);
    };
  }

  /**
   * Remove all listeners
   */
  public clearListeners(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }

  /**
   * Toggle between playing and paused
   */
  public togglePause(
    playingState: GameStateEnum,
    pausedState: GameStateEnum
  ): void {
    if (this.currentState === playingState) {
      this.setState(pausedState);
    } else if (this.currentState === pausedState) {
      this.setState(playingState);
    }
  }
}
