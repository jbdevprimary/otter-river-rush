/**
 * Character Selection Screen - React/HTML Overlay
 * Character picker with names, traits, and unlock status
 */

import { OTTER_CHARACTERS, type OtterCharacter } from '@otter-river-rush/config';
import { useGameStore } from '@otter-river-rush/state';
import type { CSSProperties } from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    fontFamily: "'Nunito', sans-serif",
    padding: '20px',
    boxSizing: 'border-box',
  } satisfies CSSProperties,

  title: {
    fontFamily: "'Fredoka One', 'Nunito', sans-serif",
    fontSize: '48px',
    color: '#ffffff',
    margin: 0,
    marginBottom: '10px',
    textShadow: '0 0 10px #4A90D9',
  } satisfies CSSProperties,

  subtitle: {
    fontSize: '20px',
    color: '#88ccff',
    margin: 0,
    marginBottom: '30px',
  } satisfies CSSProperties,

  cardsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: '920px',
  } satisfies CSSProperties,

  infoPanel: {
    width: '600px',
    maxWidth: '100%',
    padding: '20px',
    backgroundColor: 'rgba(30, 58, 95, 0.8)',
    border: '2px solid #4A90D9',
    borderRadius: '15px',
    marginBottom: '20px',
    textAlign: 'center',
  } satisfies CSSProperties,

  infoText: {
    color: '#ffffff',
    fontSize: '18px',
    lineHeight: '1.5',
    margin: 0,
    whiteSpace: 'pre-line',
  } satisfies CSSProperties,

  buttonsContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  } satisfies CSSProperties,

  backButton: {
    width: '150px',
    height: '50px',
    backgroundColor: '#666666',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '20px',
    fontFamily: "'Fredoka One', 'Nunito', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } satisfies CSSProperties,

  playButton: {
    width: '200px',
    height: '50px',
    backgroundColor: '#4A90D9',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '22px',
    fontFamily: "'Fredoka One', 'Nunito', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } satisfies CSSProperties,

  statsText: {
    fontSize: '14px',
    color: '#88ccff',
    margin: 0,
  } satisfies CSSProperties,
};

export function CharacterSelect() {
  const { selectedCharacterId, selectCharacter, startGame, returnToMenu, progress } =
    useGameStore();

  const selectedChar = OTTER_CHARACTERS.find((c) => c.id === selectedCharacterId);

  const handleBack = () => {
    returnToMenu();
  };

  const handlePlay = () => {
    startGame('classic');
  };

  return (
    <div style={styles.overlay}>
      <h1 style={styles.title}>SELECT YOUR OTTER</h1>
      <p style={styles.subtitle}>Each otter has unique abilities!</p>

      <div style={styles.cardsContainer}>
        {OTTER_CHARACTERS.map((character) => {
          const isUnlocked = progress.unlockedCharacters.includes(character.id);
          const isSelected = character.id === selectedCharacterId;

          return (
            <CharacterCard
              key={character.id}
              character={character}
              isUnlocked={isUnlocked}
              isSelected={isSelected}
              onSelect={() => {
                if (isUnlocked) {
                  selectCharacter(character.id);
                }
              }}
            />
          );
        })}
      </div>

      {selectedChar && (
        <div style={styles.infoPanel}>
          <p style={styles.infoText}>
            {`${selectedChar.name} - ${selectedChar.title}\n${selectedChar.personality}`}
          </p>
        </div>
      )}

      <div style={styles.buttonsContainer}>
        <button
          type="button"
          style={styles.backButton}
          onClick={handleBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#888888';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#666666';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          BACK
        </button>

        <button
          type="button"
          style={styles.playButton}
          onClick={handlePlay}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5ba3ec';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4A90D9';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          START GAME
        </button>
      </div>

      <p style={styles.statsText}>
        Total Distance: {Math.floor(progress.totalDistance)}m | Coins: {progress.totalCoins} | High
        Score: {progress.highScore}
      </p>
    </div>
  );
}

interface CharacterCardProps {
  character: OtterCharacter;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function CharacterCard({ character, isUnlocked, isSelected, onSelect }: CharacterCardProps) {
  const cardStyles: CSSProperties = {
    width: '200px',
    height: '350px',
    padding: '10px',
    boxSizing: 'border-box',
    border: `${isSelected ? 4 : 2}px solid ${isSelected ? '#FFD700' : isUnlocked ? '#4A90D9' : '#444444'}`,
    borderRadius: '15px',
    backgroundColor: isSelected
      ? 'rgba(74, 144, 217, 0.4)'
      : isUnlocked
        ? 'rgba(30, 58, 95, 0.6)'
        : 'rgba(30, 30, 30, 0.8)',
    cursor: isUnlocked ? 'pointer' : 'default',
    transition: 'all 0.15s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const nameStyles: CSSProperties = {
    fontFamily: "'Fredoka One', sans-serif",
    fontSize: '24px',
    color: isUnlocked ? '#ffffff' : '#666666',
    margin: 0,
    marginTop: '10px',
  };

  const titleStyles: CSSProperties = {
    fontSize: '12px',
    color: isUnlocked ? character.theme.accentColor : '#444444',
    margin: 0,
    marginTop: '5px',
  };

  const portraitStyles: CSSProperties = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: `3px solid ${isUnlocked ? character.theme.primaryColor : '#333333'}`,
    backgroundColor: isUnlocked ? character.theme.secondaryColor : '#222222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '15px',
  };

  const initialStyles: CSSProperties = {
    fontFamily: "'Fredoka One', sans-serif",
    fontSize: '48px',
    color: isUnlocked ? character.theme.primaryColor : '#444444',
    margin: 0,
  };

  const traitsContainerStyles: CSSProperties = {
    marginTop: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isUnlocked && !isSelected) {
      e.currentTarget.style.backgroundColor = 'rgba(74, 144, 217, 0.3)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isUnlocked && !isSelected) {
      e.currentTarget.style.backgroundColor = 'rgba(30, 58, 95, 0.6)';
    }
  };

  return (
    <button
      type="button"
      style={cardStyles}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={!isUnlocked}
      aria-label={`Select ${character.name}${!isUnlocked ? ' (locked)' : ''}`}
    >
      <p style={nameStyles}>{character.name}</p>
      <p style={titleStyles}>{character.title}</p>

      <div style={portraitStyles}>
        <span style={initialStyles}>{character.name[0]}</span>
      </div>

      <div style={traitsContainerStyles}>
        {isUnlocked ? (
          <TraitsList traits={character.traits} />
        ) : (
          <LockedDisplay hint={character.unlock.hint} />
        )}
      </div>
    </button>
  );
}

interface TraitsListProps {
  traits: OtterCharacter['traits'];
}

function TraitsList({ traits }: TraitsListProps) {
  const traitTextStyle = (isPositive: boolean): CSSProperties => ({
    fontSize: '11px',
    color: isPositive ? '#99ff99' : '#ff9999',
    margin: 0,
  });

  const traitsToShow: Array<{ id: string; text: string; isPositive: boolean }> = [];

  if (traits.scrollSpeedMod !== 1.0) {
    const isPositive = traits.scrollSpeedMod < 1;
    const percent = Math.round((traits.scrollSpeedMod - 1) * 100);
    traitsToShow.push({
      id: 'speed',
      text: `Speed ${percent > 0 ? '+' : ''}${percent}%`,
      isPositive,
    });
  }

  if (traits.laneChangeSpeed !== 1.0) {
    const isPositive = traits.laneChangeSpeed > 1;
    const percent = Math.round((traits.laneChangeSpeed - 1) * 100);
    traitsToShow.push({
      id: 'agility',
      text: `Agility ${percent > 0 ? '+' : ''}${percent}%`,
      isPositive,
    });
  }

  if (traits.coinValueMod !== 1.0) {
    const isPositive = traits.coinValueMod > 1;
    traitsToShow.push({
      id: 'coins',
      text: `Coins x${traits.coinValueMod}`,
      isPositive,
    });
  }

  if (traits.gemValueMod !== 1.0) {
    const isPositive = traits.gemValueMod > 1;
    traitsToShow.push({
      id: 'gems',
      text: `Gems x${traits.gemValueMod}`,
      isPositive,
    });
  }

  if (traits.startingHealth !== 3) {
    const isPositive = traits.startingHealth > 3;
    traitsToShow.push({
      id: 'health',
      text: `Hearts: ${traits.startingHealth}`,
      isPositive,
    });
  }

  return (
    <>
      {traitsToShow.map((trait) => (
        <p key={trait.id} style={traitTextStyle(trait.isPositive)}>
          {trait.text}
        </p>
      ))}
    </>
  );
}

interface LockedDisplayProps {
  hint?: string;
}

function LockedDisplay({ hint }: LockedDisplayProps) {
  return (
    <>
      <p
        style={{
          fontFamily: "'Fredoka One', sans-serif",
          fontSize: '16px',
          color: '#666666',
          margin: 0,
        }}
      >
        LOCKED
      </p>
      <p
        style={{
          fontSize: '10px',
          color: '#555555',
          margin: 0,
          marginTop: '8px',
          textAlign: 'center',
          maxWidth: '180px',
        }}
      >
        {hint ?? 'Keep playing!'}
      </p>
    </>
  );
}
