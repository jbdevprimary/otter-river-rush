import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

export function useAnimationMixer(modelUrl: string, animationUrls: Record<string, string>, currentAnimation: string) {
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<string | null>(null);
  
  const { scene, animations } = useGLTF(modelUrl);
  
  // Load animation files
  useEffect(() => {
    if (!scene) return;
    
    const mixer = new THREE.AnimationMixer(scene);
    mixerRef.current = mixer;
    
    // Create actions from base model animations
    for (const clip of animations) {
      const action = mixer.clipAction(clip);
      actionsRef.current.set(clip.name, action);
    }
    
    return () => {
      mixer.stopAllAction();
    };
  }, [scene, animations]);
  
  // Load additional animation clips
  useEffect(() => {
    const loadAnimations = async () => {
      for (const [name, url] of Object.entries(animationUrls)) {
        try {
          const { animations: clips } = await useGLTF.preload(url) as any;
          if (clips && clips.length > 0 && mixerRef.current) {
            const action = mixerRef.current.clipAction(clips[0]);
            actionsRef.current.set(name, action);
          }
        } catch (error) {
          console.warn(`Failed to load animation ${name}:`, error);
        }
      }
    };
    
    if (mixerRef.current) {
      loadAnimations();
    }
  }, [animationUrls]);
  
  // Switch animations
  useEffect(() => {
    if (!mixerRef.current) return;
    
    const newAction = actionsRef.current.get(currentAnimation);
    const oldAction = currentActionRef.current ? actionsRef.current.get(currentActionRef.current) : null;
    
    if (newAction) {
      if (oldAction && oldAction !== newAction) {
        oldAction.fadeOut(0.3);
      }
      
      newAction
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.3)
        .play();
      
      currentActionRef.current = currentAnimation;
    }
  }, [currentAnimation]);
  
  // Update mixer
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });
  
  return { mixer: mixerRef.current, actions: actionsRef.current };
}
