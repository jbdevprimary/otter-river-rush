import { useGameStore } from '../../hooks/useGameStore';
import { queries } from '../../ecs/world';
import { useBiome } from '../../ecs/biome-system';

export function GameHUD() {
  const { score, distance, coins, gems, combo } = useGameStore();
  const [player] = queries.player.entities;
  const biome = useBiome();
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Stats */}
      <div className="absolute top-4 left-4 space-y-2">
        <div id="score" className="text-4xl font-bold text-white drop-shadow-lg" data-testid="score">
          {Math.floor(score).toLocaleString()}
        </div>
        <div id="distance" className="text-xl text-blue-300" data-testid="distance">
          {Math.floor(distance)}m
        </div>
        {combo > 0 && (
          <div className="text-2xl text-yellow-400 animate-pulse">
            {combo}x COMBO!
          </div>
        )}
      </div>
      
      {/* Top Right - Collectibles */}
      <div className="absolute top-4 right-4 space-y-2 text-right">
        <div className="text-xl text-yellow-400">
          💰 {coins}
        </div>
        <div className="text-xl text-pink-400">
          💎 {gems}
        </div>
      </div>
      
      {/* Bottom Left - Health */}
      {player && player.health && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`text-3xl ${i < player.health! ? 'opacity-100' : 'opacity-20'}`}
            >
              ❤️
            </div>
          ))}
        </div>
      )}
      
      {/* Bottom Center - Biome */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
        <div className="text-sm text-blue-200 opacity-70">
          {biome.name}
        </div>
      </div>
      
      {/* Power-up indicators */}
      {player && (
        <div className="absolute top-20 right-4 space-y-1">
          {player.ghost && (
            <div className="text-sm bg-purple-500/80 px-3 py-1 rounded">
              👻 Ghost
            </div>
          )}
          {player.invincible && (
            <div className="text-sm bg-blue-500/80 px-3 py-1 rounded">
              🛡️ Shield
            </div>
          )}
          {(player as any).magnetActive && (
            <div className="text-sm bg-yellow-500/80 px-3 py-1 rounded">
              🧲 Magnet
            </div>
          )}
        </div>
      )}
    </div>
  );
}
