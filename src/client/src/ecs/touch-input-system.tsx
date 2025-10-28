import { useEffect } from 'react';
import { queries } from './world';
import { useGameStore } from '../hooks/useGameStore';

const LANES = [-2, 0, 2];

export function TouchInputSystem() {
  const { status } = useGameStore();
  
  useEffect(() => {
    if (status !== 'playing') return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 50;
    
    function handleTouchStart(e: TouchEvent) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e: TouchEvent) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      const [player] = queries.player.entities;
      if (!player) return;
      
      // Horizontal swipe
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
        const currentLane = player.lane || 0;
        
        if (deltaX > 0 && currentLane < 1) {
          // Swipe right
          player.lane = (currentLane + 1) as -1 | 0 | 1;
          player.position.x = LANES[player.lane + 1];
          
          if (player.animation) {
            player.animation.current = 'dodge-right';
            setTimeout(() => {
              if (player.animation) player.animation.current = 'walk';
            }, 300);
          }
        } else if (deltaX < 0 && currentLane > -1) {
          // Swipe left
          player.lane = (currentLane - 1) as -1 | 0 | 1;
          player.position.x = LANES[player.lane + 1];
          
          if (player.animation) {
            player.animation.current = 'dodge-left';
            setTimeout(() => {
              if (player.animation) player.animation.current = 'walk';
            }, 300);
          }
        }
      }
      
      // Vertical swipe up (jump)
      if (deltaY < -swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (player.animation) {
          player.animation.current = 'jump';
          setTimeout(() => {
            if (player.animation) player.animation.current = 'walk';
          }, 400);
        }
      }
    }
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status]);
  
  return null;
}
