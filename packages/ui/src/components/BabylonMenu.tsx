/**
 * Babylon.js Menu Component
 * Main menu and game over screens using Babylon.js GUI
 */

import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import {
  AdvancedDynamicTexture,
  TextBlock,
  Button,
  Rectangle,
  StackPanel,
  Control,
} from '@babylonjs/gui';
import { useGameStore } from '@otter-river-rush/state';
import { UI_COLORS } from '@otter-river-rush/config';

interface BabylonMenuProps {
  type: 'menu' | 'game_over';
}

export function BabylonMenu({ type }: BabylonMenuProps) {
  const scene = useScene();
  const guiRef = useRef<AdvancedDynamicTexture | null>(null);
  const score = useGameStore((state) => state.score);

  useEffect(() => {
    if (!scene) return;

    // Create fullscreen GUI
    const gui = AdvancedDynamicTexture.CreateFullscreenUI('Menu', true, scene);
    guiRef.current = gui;

    // Create background overlay
    const overlay = new Rectangle('overlay');
    overlay.width = '100%';
    overlay.height = '100%';
    overlay.background = UI_COLORS.menu.background;
    overlay.alpha = 0.85;
    overlay.thickness = 0;
    overlay.isPointerBlocker = false; // Allow clicks to pass through to buttons
    gui.addControl(overlay);

    // Create main container
    const container = new StackPanel('menuContainer');
    container.width = '400px';
    container.isVertical = true;
    container.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    container.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    gui.addControl(container);

    if (type === 'menu') {
      createMainMenu(container, gui);
    } else {
      createGameOverMenu(container, gui, score);
    }

    return () => {
      gui.dispose();
    };
  }, [scene, type, score]);

  return null;
}

function createMainMenu(container: StackPanel, _gui: AdvancedDynamicTexture) {
  const state = useGameStore.getState();
  const selectedChar = state.getSelectedCharacter();

  // Title
  const title = new TextBlock('title');
  title.text = 'OTTER\nRIVER\nRUSH';
  title.color = UI_COLORS.menu.text;
  title.fontSize = 64;
  title.fontFamily = 'monospace';
  title.fontWeight = 'bold';
  title.height = '220px';
  title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  title.shadowColor = UI_COLORS.menu.accent;
  title.shadowBlur = 15;
  title.shadowOffsetX = 0;
  title.shadowOffsetY = 0;
  container.addControl(title);

  // Subtitle
  const subtitle = new TextBlock('subtitle');
  subtitle.text = 'A 3-lane river adventure!';
  subtitle.color = UI_COLORS.menu.accent;
  subtitle.fontSize = 20;
  subtitle.fontFamily = 'monospace';
  subtitle.height = '40px';
  subtitle.paddingBottom = '20px';
  container.addControl(subtitle);

  // Selected character display
  const charInfo = new TextBlock('charInfo');
  charInfo.text = `Playing as: ${selectedChar.name}`;
  charInfo.color = selectedChar.theme.accentColor;
  charInfo.fontSize = 18;
  charInfo.fontFamily = 'monospace';
  charInfo.height = '30px';
  charInfo.paddingBottom = '20px';
  container.addControl(charInfo);

  // Start button
  const startBtn = createStyledButton('startBtn', 'PLAY GAME', () => {
    useGameStore.getState().startGame('classic');
  });
  container.addControl(startBtn);

  // Select character button
  const selectBtn = createStyledButton('selectBtn', 'SELECT OTTER', () => {
    useGameStore.getState().goToCharacterSelect();
  }, '#6366f1');
  container.addControl(selectBtn);

  // Controls info
  const controls = new TextBlock('controls');
  controls.text = '← → or A D to move\nAvoid rocks, collect coins!';
  controls.color = '#94a3b8';
  controls.fontSize = 16;
  controls.fontFamily = 'monospace';
  controls.height = '60px';
  controls.paddingTop = '30px';
  controls.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  container.addControl(controls);
}

function createGameOverMenu(container: StackPanel, _gui: AdvancedDynamicTexture, finalScore: number) {
  // Game Over title
  const title = new TextBlock('gameOverTitle');
  title.text = 'GAME OVER';
  title.color = UI_COLORS.health;
  title.fontSize = 56;
  title.fontFamily = 'monospace';
  title.fontWeight = 'bold';
  title.height = '80px';
  title.shadowColor = '#000000';
  title.shadowBlur = 10;
  title.shadowOffsetX = 3;
  title.shadowOffsetY = 3;
  container.addControl(title);

  // Final score
  const scoreLabel = new TextBlock('scoreLabel');
  scoreLabel.text = 'FINAL SCORE';
  scoreLabel.color = '#94a3b8';
  scoreLabel.fontSize = 20;
  scoreLabel.fontFamily = 'monospace';
  scoreLabel.height = '40px';
  scoreLabel.paddingTop = '20px';
  container.addControl(scoreLabel);

  const scoreValue = new TextBlock('scoreValue');
  scoreValue.text = String(finalScore);
  scoreValue.color = UI_COLORS.combo;
  scoreValue.fontSize = 72;
  scoreValue.fontFamily = 'monospace';
  scoreValue.fontWeight = 'bold';
  scoreValue.height = '100px';
  scoreValue.shadowColor = UI_COLORS.combo;
  scoreValue.shadowBlur = 20;
  scoreValue.shadowOffsetX = 0;
  scoreValue.shadowOffsetY = 0;
  container.addControl(scoreValue);

  // Play again button
  const playAgainBtn = createStyledButton('playAgainBtn', 'PLAY AGAIN', () => {
    useGameStore.getState().startGame('classic');
  });
  playAgainBtn.paddingTop = '30px';
  container.addControl(playAgainBtn);

  // Menu button
  const menuBtn = createStyledButton('menuBtn', 'MAIN MENU', () => {
    useGameStore.getState().returnToMenu();
  }, '#475569');
  container.addControl(menuBtn);
}

function createStyledButton(
  name: string,
  text: string,
  onClick: () => void,
  color: string = UI_COLORS.menu.accent
): Button {
  const button = Button.CreateSimpleButton(name, text);
  button.width = '280px';
  button.height = '60px';
  button.color = '#ffffff';
  button.background = color;
  button.cornerRadius = 10;
  button.thickness = 0;
  button.fontFamily = 'monospace';
  button.fontSize = 24;
  button.fontWeight = 'bold';
  button.paddingTop = '15px';
  button.isPointerBlocker = true; // Ensure button captures pointer events

  // Hover effects
  button.onPointerEnterObservable.add(() => {
    button.background = '#60a5fa';
    button.scaleX = 1.05;
    button.scaleY = 1.05;
  });

  button.onPointerOutObservable.add(() => {
    button.background = color;
    button.scaleX = 1;
    button.scaleY = 1;
  });

  // Use onPointerClickObservable for reliable click detection
  button.onPointerClickObservable.add(onClick);

  return button;
}
