/**
 * Babylon.js HUD Component
 * Heads-up display using Babylon.js GUI (AdvancedDynamicTexture)
 */

import { AdvancedDynamicTexture, Control, Rectangle, StackPanel, TextBlock } from '@babylonjs/gui';
import { UI_COLORS } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';

export function BabylonHUD() {
  const scene = useScene();
  const guiRef = useRef<AdvancedDynamicTexture | null>(null);
  const scoreTextRef = useRef<TextBlock | null>(null);
  const distanceTextRef = useRef<TextBlock | null>(null);
  const livesTextRef = useRef<TextBlock | null>(null);
  const comboTextRef = useRef<TextBlock | null>(null);

  // Subscribe to game state
  const score = useGameStore((state) => state.score);
  const distance = useGameStore((state) => state.distance);
  const lives = useGameStore((state) => state.lives);
  const combo = useGameStore((state) => state.combo);

  useEffect(() => {
    if (!scene) return;

    // Create fullscreen GUI
    const gui = AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);
    guiRef.current = gui;

    // Create top panel for HUD
    const topPanel = new StackPanel('topPanel');
    topPanel.isVertical = false;
    topPanel.height = '80px';
    topPanel.width = '100%';
    topPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    topPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    topPanel.paddingTop = '20px';
    gui.addControl(topPanel);

    // Left side panel (score & distance)
    const leftPanel = new StackPanel('leftPanel');
    leftPanel.isVertical = true;
    leftPanel.width = '200px';
    leftPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    leftPanel.paddingLeft = '20px';
    topPanel.addControl(leftPanel);

    // Score text
    const scoreText = new TextBlock('scoreText');
    scoreText.text = 'SCORE: 0';
    scoreText.color = UI_COLORS.score;
    scoreText.fontSize = 28;
    scoreText.fontFamily = 'monospace';
    scoreText.fontWeight = 'bold';
    scoreText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    scoreText.height = '35px';
    scoreText.shadowColor = '#000000';
    scoreText.shadowBlur = 4;
    scoreText.shadowOffsetX = 2;
    scoreText.shadowOffsetY = 2;
    leftPanel.addControl(scoreText);
    scoreTextRef.current = scoreText;

    // Distance text
    const distanceText = new TextBlock('distanceText');
    distanceText.text = 'DISTANCE: 0m';
    distanceText.color = UI_COLORS.distance;
    distanceText.fontSize = 20;
    distanceText.fontFamily = 'monospace';
    distanceText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    distanceText.height = '30px';
    distanceText.shadowColor = '#000000';
    distanceText.shadowBlur = 2;
    distanceText.shadowOffsetX = 1;
    distanceText.shadowOffsetY = 1;
    leftPanel.addControl(distanceText);
    distanceTextRef.current = distanceText;

    // Spacer
    const spacer = new Rectangle('spacer');
    spacer.width = '1';
    spacer.height = '1';
    spacer.thickness = 0;
    topPanel.addControl(spacer);

    // Right side panel (lives & combo)
    const rightPanel = new StackPanel('rightPanel');
    rightPanel.isVertical = true;
    rightPanel.width = '200px';
    rightPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    rightPanel.paddingRight = '20px';
    topPanel.addControl(rightPanel);

    // Lives text
    const livesText = new TextBlock('livesText');
    livesText.text = '\u2665 \u2665 \u2665';
    livesText.color = UI_COLORS.health;
    livesText.fontSize = 28;
    livesText.fontFamily = 'monospace';
    livesText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    livesText.height = '35px';
    livesText.shadowColor = '#000000';
    livesText.shadowBlur = 4;
    livesText.shadowOffsetX = 2;
    livesText.shadowOffsetY = 2;
    rightPanel.addControl(livesText);
    livesTextRef.current = livesText;

    // Combo text
    const comboText = new TextBlock('comboText');
    comboText.text = '';
    comboText.color = UI_COLORS.combo;
    comboText.fontSize = 24;
    comboText.fontFamily = 'monospace';
    comboText.fontWeight = 'bold';
    comboText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    comboText.height = '30px';
    comboText.shadowColor = '#000000';
    comboText.shadowBlur = 3;
    comboText.shadowOffsetX = 1;
    comboText.shadowOffsetY = 1;
    rightPanel.addControl(comboText);
    comboTextRef.current = comboText;

    return () => {
      gui.dispose();
    };
  }, [scene]);

  // Update HUD values when game state changes
  useEffect(() => {
    if (scoreTextRef.current) {
      scoreTextRef.current.text = `SCORE: ${score}`;
    }
  }, [score]);

  useEffect(() => {
    if (distanceTextRef.current) {
      distanceTextRef.current.text = `DISTANCE: ${Math.floor(distance)}m`;
    }
  }, [distance]);

  useEffect(() => {
    if (livesTextRef.current) {
      livesTextRef.current.text = '\u2665 '.repeat(lives).trim() || '\u2661';
    }
  }, [lives]);

  useEffect(() => {
    if (comboTextRef.current) {
      comboTextRef.current.text = combo > 1 ? `COMBO x${combo}` : '';
    }
  }, [combo]);

  return null;
}
