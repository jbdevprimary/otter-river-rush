/**
 * Character Selection Screen
 * Babylon.js GUI-based character picker with names, traits, and unlock status
 */

import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Rectangle,
  StackPanel,
  TextBlock,
} from '@babylonjs/gui';
import { OTTER_CHARACTERS, type OtterCharacter } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';

export function CharacterSelect() {
  const scene = useScene();
  const guiRef = useRef<AdvancedDynamicTexture | null>(null);
  const { selectedCharacterId, selectCharacter, startGame, returnToMenu, progress } =
    useGameStore();

  useEffect(() => {
    if (!scene) return;

    // Create fullscreen GUI
    const gui = AdvancedDynamicTexture.CreateFullscreenUI('CharacterSelectUI', true, scene);
    guiRef.current = gui;

    // Main container
    const mainPanel = new Rectangle('mainPanel');
    mainPanel.width = '100%';
    mainPanel.height = '100%';
    mainPanel.thickness = 0;
    mainPanel.background = 'rgba(10, 22, 40, 0.95)';
    gui.addControl(mainPanel);

    // Title
    const title = new TextBlock('title', 'SELECT YOUR OTTER');
    title.fontFamily = 'Fredoka One, Nunito, sans-serif';
    title.fontSize = 48;
    title.color = '#ffffff';
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    title.top = '-280px';
    title.shadowColor = '#4A90D9';
    title.shadowBlur = 10;
    mainPanel.addControl(title);

    // Subtitle
    const subtitle = new TextBlock('subtitle', 'Each otter has unique abilities!');
    subtitle.fontFamily = 'Nunito, sans-serif';
    subtitle.fontSize = 20;
    subtitle.color = '#88ccff';
    subtitle.top = '-230px';
    mainPanel.addControl(subtitle);

    // Character cards container (horizontal layout)
    const cardsPanel = new StackPanel('cardsPanel');
    cardsPanel.isVertical = false;
    cardsPanel.height = '380px';
    cardsPanel.width = '900px';
    cardsPanel.spacing = 20;
    cardsPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    cardsPanel.top = '20px';
    mainPanel.addControl(cardsPanel);

    // Create character cards
    OTTER_CHARACTERS.forEach((character) => {
      const isUnlocked = progress.unlockedCharacters.includes(character.id);
      const isSelected = character.id === selectedCharacterId;

      const card = createCharacterCard(character, isUnlocked, isSelected, () => {
        if (isUnlocked) {
          selectCharacter(character.id);
          // Refresh the UI to show new selection
          refreshCards();
        }
      });
      cardsPanel.addControl(card);
    });

    // Refresh cards function to update selection state
    const refreshCards = () => {
      // Clear and recreate cards
      cardsPanel.clearControls();
      const currentSelection = useGameStore.getState().selectedCharacterId;

      OTTER_CHARACTERS.forEach((character) => {
        const isUnlocked = progress.unlockedCharacters.includes(character.id);
        const isSelected = character.id === currentSelection;

        const card = createCharacterCard(character, isUnlocked, isSelected, () => {
          if (isUnlocked) {
            selectCharacter(character.id);
            refreshCards();
          }
        });
        cardsPanel.addControl(card);
      });
    };

    // Selected character info panel
    const infoPanel = new Rectangle('infoPanel');
    infoPanel.width = '600px';
    infoPanel.height = '100px';
    infoPanel.top = '230px';
    infoPanel.thickness = 2;
    infoPanel.color = '#4A90D9';
    infoPanel.background = 'rgba(30, 58, 95, 0.8)';
    infoPanel.cornerRadius = 15;
    mainPanel.addControl(infoPanel);

    const selectedChar = OTTER_CHARACTERS.find((c) => c.id === selectedCharacterId);
    if (selectedChar) {
      const infoText = new TextBlock('infoText');
      infoText.text = `${selectedChar.name} - ${selectedChar.title}\n${selectedChar.personality}`;
      infoText.fontFamily = 'Nunito, sans-serif';
      infoText.fontSize = 18;
      infoText.color = '#ffffff';
      infoText.textWrapping = true;
      infoText.lineSpacing = '8px';
      infoPanel.addControl(infoText);
    }

    // Buttons panel
    const buttonsPanel = new StackPanel('buttonsPanel');
    buttonsPanel.isVertical = false;
    buttonsPanel.height = '60px';
    buttonsPanel.top = '320px';
    buttonsPanel.spacing = 20;
    mainPanel.addControl(buttonsPanel);

    // Back button
    const backBtn = Button.CreateSimpleButton('backBtn', 'BACK');
    backBtn.width = '150px';
    backBtn.height = '50px';
    backBtn.color = '#ffffff';
    backBtn.background = '#666666';
    backBtn.cornerRadius = 10;
    backBtn.thickness = 0;
    backBtn.fontFamily = 'Fredoka One, Nunito, sans-serif';
    backBtn.fontSize = 20;
    backBtn.isPointerBlocker = true;
    backBtn.onPointerClickObservable.add(() => {
      returnToMenu();
    });
    buttonsPanel.addControl(backBtn);

    // Play button
    const playBtn = Button.CreateSimpleButton('playBtn', 'START GAME');
    playBtn.width = '200px';
    playBtn.height = '50px';
    playBtn.color = '#ffffff';
    playBtn.background = '#4A90D9';
    playBtn.cornerRadius = 10;
    playBtn.thickness = 0;
    playBtn.fontFamily = 'Fredoka One, Nunito, sans-serif';
    playBtn.fontSize = 22;
    playBtn.isPointerBlocker = true;
    playBtn.onPointerClickObservable.add(() => {
      startGame('classic');
    });

    // Hover effects
    playBtn.onPointerEnterObservable.add(() => {
      playBtn.background = '#5ba3ec';
      playBtn.scaleX = 1.05;
      playBtn.scaleY = 1.05;
    });
    playBtn.onPointerOutObservable.add(() => {
      playBtn.background = '#4A90D9';
      playBtn.scaleX = 1;
      playBtn.scaleY = 1;
    });
    buttonsPanel.addControl(playBtn);

    // Progress stats
    const statsText = new TextBlock('stats');
    statsText.text = `Total Distance: ${Math.floor(progress.totalDistance)}m | Coins: ${progress.totalCoins} | High Score: ${progress.highScore}`;
    statsText.fontFamily = 'Nunito, sans-serif';
    statsText.fontSize = 14;
    statsText.color = '#88ccff';
    statsText.top = '370px';
    mainPanel.addControl(statsText);

    return () => {
      gui.dispose();
      guiRef.current = null;
    };
  }, [scene, selectedCharacterId, progress, returnToMenu, selectCharacter, startGame]);

  return null;
}

/**
 * Create a character card
 */
function createCharacterCard(
  character: OtterCharacter,
  isUnlocked: boolean,
  isSelected: boolean,
  onSelect: () => void
): Rectangle {
  const card = new Rectangle(`card-${character.id}`);
  card.width = '200px';
  card.height = '350px';
  card.thickness = isSelected ? 4 : 2;
  card.color = isSelected ? '#FFD700' : isUnlocked ? '#4A90D9' : '#444444';
  card.background = isSelected
    ? 'rgba(74, 144, 217, 0.4)'
    : isUnlocked
      ? 'rgba(30, 58, 95, 0.6)'
      : 'rgba(30, 30, 30, 0.8)';
  card.cornerRadius = 15;
  card.paddingTop = '10px';

  if (isUnlocked) {
    card.onPointerUpObservable.add(onSelect);
    card.onPointerEnterObservable.add(() => {
      if (!isSelected) {
        card.background = 'rgba(74, 144, 217, 0.3)';
      }
    });
    card.onPointerOutObservable.add(() => {
      if (!isSelected) {
        card.background = 'rgba(30, 58, 95, 0.6)';
      }
    });
  }

  // Character name
  const nameText = new TextBlock(`name-${character.id}`, character.name);
  nameText.fontFamily = 'Fredoka One, sans-serif';
  nameText.fontSize = 24;
  nameText.color = isUnlocked ? '#ffffff' : '#666666';
  nameText.top = '-140px';
  nameText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
  card.addControl(nameText);

  // Title
  const titleText = new TextBlock(`title-${character.id}`, character.title);
  titleText.fontFamily = 'Nunito, sans-serif';
  titleText.fontSize = 12;
  titleText.color = isUnlocked ? character.theme.accentColor : '#444444';
  titleText.top = '-115px';
  card.addControl(titleText);

  // Thumbnail placeholder (colored circle representing the otter)
  const portrait = new Rectangle(`portrait-${character.id}`);
  portrait.width = '100px';
  portrait.height = '100px';
  portrait.cornerRadius = 50;
  portrait.thickness = 3;
  portrait.color = isUnlocked ? character.theme.primaryColor : '#333333';
  portrait.background = isUnlocked ? character.theme.secondaryColor : '#222222';
  portrait.top = '-30px';
  card.addControl(portrait);

  // Otter initial in portrait
  const initial = new TextBlock(`initial-${character.id}`, character.name[0]);
  initial.fontFamily = 'Fredoka One, sans-serif';
  initial.fontSize = 48;
  initial.color = isUnlocked ? character.theme.primaryColor : '#444444';
  initial.top = '-30px';
  card.addControl(initial);

  // Traits panel
  const traitsPanel = new StackPanel(`traits-${character.id}`);
  traitsPanel.isVertical = true;
  traitsPanel.top = '70px';
  traitsPanel.spacing = 4;
  card.addControl(traitsPanel);

  if (isUnlocked) {
    // Show traits
    const traits = character.traits;

    // Speed trait
    if (traits.scrollSpeedMod !== 1.0) {
      const speedText = new TextBlock();
      speedText.text =
        traits.scrollSpeedMod > 1
          ? `Speed +${Math.round((traits.scrollSpeedMod - 1) * 100)}%`
          : `Speed ${Math.round((traits.scrollSpeedMod - 1) * 100)}%`;
      speedText.fontSize = 11;
      speedText.color = traits.scrollSpeedMod > 1 ? '#ff9999' : '#99ff99';
      speedText.height = '16px';
      traitsPanel.addControl(speedText);
    }

    // Lane change
    if (traits.laneChangeSpeed !== 1.0) {
      const laneText = new TextBlock();
      laneText.text =
        traits.laneChangeSpeed > 1
          ? `Agility +${Math.round((traits.laneChangeSpeed - 1) * 100)}%`
          : `Agility ${Math.round((traits.laneChangeSpeed - 1) * 100)}%`;
      laneText.fontSize = 11;
      laneText.color = traits.laneChangeSpeed > 1 ? '#99ff99' : '#ff9999';
      laneText.height = '16px';
      traitsPanel.addControl(laneText);
    }

    // Coin bonus
    if (traits.coinValueMod !== 1.0) {
      const coinText = new TextBlock();
      coinText.text =
        traits.coinValueMod > 1 ? `Coins x${traits.coinValueMod}` : `Coins x${traits.coinValueMod}`;
      coinText.fontSize = 11;
      coinText.color = traits.coinValueMod > 1 ? '#ffdd44' : '#ff9999';
      coinText.height = '16px';
      traitsPanel.addControl(coinText);
    }

    // Gem bonus
    if (traits.gemValueMod !== 1.0) {
      const gemText = new TextBlock();
      gemText.text =
        traits.gemValueMod > 1 ? `Gems x${traits.gemValueMod}` : `Gems x${traits.gemValueMod}`;
      gemText.fontSize = 11;
      gemText.color = traits.gemValueMod > 1 ? '#ff44ff' : '#ff9999';
      gemText.height = '16px';
      traitsPanel.addControl(gemText);
    }

    // Health
    if (traits.startingHealth !== 3) {
      const healthText = new TextBlock();
      healthText.text = `Hearts: ${traits.startingHealth}`;
      healthText.fontSize = 11;
      healthText.color = traits.startingHealth > 3 ? '#99ff99' : '#ff9999';
      healthText.height = '16px';
      traitsPanel.addControl(healthText);
    }
  } else {
    // Show unlock requirement
    const lockText = new TextBlock();
    lockText.text = 'LOCKED';
    lockText.fontFamily = 'Fredoka One, sans-serif';
    lockText.fontSize = 16;
    lockText.color = '#666666';
    lockText.height = '24px';
    traitsPanel.addControl(lockText);

    const hintText = new TextBlock();
    hintText.text = character.unlock.hint ?? 'Keep playing!';
    hintText.fontSize = 10;
    hintText.color = '#555555';
    hintText.textWrapping = true;
    hintText.height = '40px';
    hintText.width = '180px';
    traitsPanel.addControl(hintText);
  }

  return card;
}
