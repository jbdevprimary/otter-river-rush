/**
 * GLB Model Loader
 * Utilities for loading GLB models in Babylon.js
 */

import { SceneLoader, type AbstractMesh, type Scene } from '@babylonjs/core';
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
  dispose: () => void;
}

/**
 * Load a GLB model
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

  return {
    meshes: result.meshes as AbstractMesh[],
    rootMesh: rootMesh as AbstractMesh,
    dispose: () => {
      for (const mesh of result.meshes) {
        mesh.dispose();
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
