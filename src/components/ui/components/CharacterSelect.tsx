/**
 * Character Selection Screen - Cross-platform React Native/Web
 * Character picker with names, traits, and unlock status
 * Uses NativeWind styling
 */

import { OTTER_CHARACTERS, type OtterCharacter } from '../../../game/config';
import { useGameStore } from '../../../game/store';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
    <View className="absolute inset-0 bg-brand-background/95 flex-col items-center justify-center z-[200] p-5">
      <Text className="text-white text-5xl font-bold mb-2.5">
        SELECT YOUR OTTER
      </Text>
      <Text className="text-blue-300 text-xl mb-8">
        Each otter has unique abilities!
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        className="mb-8"
      >
        <View className="flex-row gap-5 justify-center max-w-[920px]">
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
        </View>
      </ScrollView>

      {selectedChar && (
        <View className="w-[600px] max-w-full p-5 bg-blue-900/50 border-2 border-blue-500 rounded-2xl mb-5">
          <Text className="text-white text-lg text-center leading-6">
            {`${selectedChar.name} - ${selectedChar.title}\n${selectedChar.personality}`}
          </Text>
        </View>
      )}

      <View className="flex-row gap-5 mb-5">
        <Pressable
          className="w-[150px] h-[50px] bg-slate-600 rounded-xl items-center justify-center active:bg-slate-500 active:scale-105"
          onPress={handleBack}
        >
          <Text className="text-white text-xl font-bold">BACK</Text>
        </Pressable>

        <Pressable
          className="w-[200px] h-[50px] bg-blue-500 rounded-xl items-center justify-center active:bg-blue-400 active:scale-105"
          onPress={handlePlay}
        >
          <Text className="text-white text-2xl font-bold">START GAME</Text>
        </Pressable>
      </View>

      <Text className="text-blue-300 text-sm">
        Total Distance: {Math.floor(progress.totalDistance)}m | Coins:{' '}
        {progress.totalCoins} | High Score: {progress.highScore}
      </Text>
    </View>
  );
}

interface CharacterCardProps {
  character: OtterCharacter;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function CharacterCard({
  character,
  isUnlocked,
  isSelected,
  onSelect,
}: CharacterCardProps) {
  const borderColor = isSelected
    ? 'border-brand-gold'
    : isUnlocked
      ? 'border-blue-500'
      : 'border-slate-700';

  const bgColor = isSelected
    ? 'bg-blue-500/40'
    : isUnlocked
      ? 'bg-blue-900/60'
      : 'bg-slate-800/80';

  return (
    <Pressable
      className={`w-[200px] h-[350px] p-2.5 rounded-2xl flex-col items-center ${borderColor} ${bgColor} ${
        isSelected ? 'border-4' : 'border-2'
      } ${isUnlocked ? 'active:bg-blue-500/30' : ''}`}
      onPress={onSelect}
      disabled={!isUnlocked}
      accessibilityLabel={`Select ${character.name}${!isUnlocked ? ' (locked)' : ''}`}
    >
      <Text
        className={`text-2xl font-bold mt-2.5 ${
          isUnlocked ? 'text-white' : 'text-slate-600'
        }`}
      >
        {character.name}
      </Text>
      <Text
        className="text-xs mt-1.5"
        style={{ color: isUnlocked ? character.theme.accentColor : '#444444' }}
      >
        {character.title}
      </Text>

      {/* Portrait */}
      <View
        className={`w-[100px] h-[100px] rounded-full mt-4 items-center justify-center border-[3px]`}
        style={{
          borderColor: isUnlocked ? character.theme.primaryColor : '#333333',
          backgroundColor: isUnlocked
            ? character.theme.secondaryColor
            : '#222222',
        }}
      >
        <Text
          className="text-5xl font-bold"
          style={{
            color: isUnlocked ? character.theme.primaryColor : '#444444',
          }}
        >
          {character.name[0]}
        </Text>
      </View>

      <View className="mt-4 flex-col items-center gap-1 flex-1">
        {isUnlocked ? (
          <TraitsList traits={character.traits} />
        ) : (
          <LockedDisplay hint={character.unlock.hint} />
        )}
      </View>
    </Pressable>
  );
}

interface TraitsListProps {
  traits: OtterCharacter['traits'];
}

function TraitsList({ traits }: TraitsListProps) {
  const traitsToShow: Array<{ id: string; text: string; isPositive: boolean }> =
    [];

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
        <Text
          key={trait.id}
          className={`text-xs ${
            trait.isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {trait.text}
        </Text>
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
      <Text className="text-slate-600 text-base font-bold">LOCKED</Text>
      <Text className="text-slate-700 text-[10px] mt-2 text-center max-w-[180px]">
        {hint ?? 'Keep playing!'}
      </Text>
    </>
  );
}
