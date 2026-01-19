/**
 * GLB Model Loader
 * Utilities for loading GLB models in Babylon.js with animation support
 */

import {
  type AbstractMesh,
  type AnimationGroup,
  type Scene,
  SceneLoader,
  type Skeleton,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

export interface LoadGLBOptions {
  scene: Scene;
  url: string;
  name?: string;
  scaling?: number;
  onProgress?: (event: { loaded: number; total: number }) => void;
}

export interface GLBResult {
  meshes: AbstractMesh[];
  rootMesh: AbstractMesh;
  animationGroups: AnimationGroup[];
  skeletons: Skeleton[];
  dispose: () => void;
  /** Play an animation by name or index */
  playAnimation: (
    nameOrIndex: string | number,
    loop?: boolean,
    speed?: number
  ) => AnimationGroup | null;
  /** Stop all animations */
  stopAllAnimations: () => void;
}

/**
 * Load a GLB model with full animation support
 */
export async function loadGLB(options: LoadGLBOptions): Promise<GLBResult> {
  const { scene, url, name, scaling = 1, onProgress } = options;

  const result = await SceneLoader.ImportMeshAsync(
    '',
    '',
    url,
    scene,
    onProgress ? (event) => onProgress({ loaded: event.loaded, total: event.total }) : undefined,
    '.glb'
  );

  const rootMesh = result.meshes[0];
  if (name) {
    rootMesh.name = name;
  }

  // Apply scaling
  if (scaling !== 1) {
    rootMesh.scaling.setAll(scaling);
  }

  const animationGroups = result.animationGroups || [];
  const skeletons = result.skeletons || [];

  // Stop all animations initially
  for (const ag of animationGroups) {
    ag.stop();
  }

  return {
    meshes: result.meshes as AbstractMesh[],
    rootMesh: rootMesh as AbstractMesh,
    animationGroups,
    skeletons,
    dispose: () => {
      // Stop and dispose animations
      animationGroups.forEach((ag) => {
        ag.stop();
        ag.dispose();
      });
      // Dispose meshes
      for (const mesh of result.meshes) {
        mesh.dispose();
      }
    },
    playAnimation: (nameOrIndex: string | number, loop = true, speed = 1.0) => {
      // Stop all current animations first
      for (const ag of animationGroups) {
        ag.stop();
      }

      let targetAnim: AnimationGroup | undefined;

      if (typeof nameOrIndex === 'number') {
        targetAnim = animationGroups[nameOrIndex];
      } else {
        // Find by name (case-insensitive partial match)
        const searchName = nameOrIndex.toLowerCase();
        targetAnim = animationGroups.find((ag) => ag.name.toLowerCase().includes(searchName));
      }

      if (targetAnim) {
        targetAnim.start(loop, speed, targetAnim.from, targetAnim.to, false);
        return targetAnim;
      }

      return null;
    },
    stopAllAnimations: () => {
      for (const ag of animationGroups) {
        ag.stop();
      }
    },
  };
}

/**
 * Preload multiple GLB models
 */
export async function preloadGLBs(
  scene: Scene,
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, GLBResult>> {
  const results = new Map<string, GLBResult>();
  let loaded = 0;

  for (const url of urls) {
    const result = await loadGLB({
      scene,
      url,
      onProgress: () => {
        loaded++;
        onProgress?.(loaded, urls.length);
      },
    });
    results.set(url, result);
  }

  return results;
}
