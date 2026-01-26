/**
 * GLB Model Loader Utilities
 * Utilities for loading GLB models in Three.js / React Three Fiber
 * Uses @react-three/drei's useGLTF under the hood for caching
 *
 * NOTE: For R3F components, prefer using useGLTF directly from @react-three/drei
 * These utilities are for imperative loading outside of React components
 */

import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface LoadGLBOptions {
  url: string;
  name?: string;
  scaling?: number;
  onProgress?: (event: { loaded: number; total: number }) => void;
}

export interface GLBResult {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  mixer: THREE.AnimationMixer | null;
  dispose: () => void;
  /** Play an animation by name or index */
  playAnimation: (
    nameOrIndex: string | number,
    loop?: boolean,
    speed?: number
  ) => THREE.AnimationAction | null;
  /** Stop all animations */
  stopAllAnimations: () => void;
}

// Singleton loader instances
let gltfLoader: GLTFLoader | null = null;
let dracoLoader: DRACOLoader | null = null;

/**
 * Get or create the GLTF loader with DRACO support
 */
function getLoader(): GLTFLoader {
  if (!gltfLoader) {
    gltfLoader = new GLTFLoader();

    // Set up DRACO loader for compressed models
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  return gltfLoader;
}

/**
 * Load a GLB model with full animation support
 * For use outside of React components (imperative loading)
 */
export async function loadGLB(options: LoadGLBOptions): Promise<GLBResult> {
  const { url, name, scaling = 1, onProgress } = options;

  console.log(`[GLB Loader] Loading: ${url}`);

  const loader = getLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf: GLTF) => {
        const scene = gltf.scene;

        if (name) {
          scene.name = name;
        }

        // Apply scaling
        if (scaling !== 1) {
          scene.scale.setScalar(scaling);
        }

        const animations = gltf.animations || [];
        const mixer = animations.length > 0 ? new THREE.AnimationMixer(scene) : null;
        const actions: THREE.AnimationAction[] = [];

        // Create actions for all animations
        if (mixer) {
          for (const clip of animations) {
            const action = mixer.clipAction(clip);
            actions.push(action);
          }
        }

        resolve({
          scene,
          animations,
          mixer,
          dispose: () => {
            // Stop all animations
            if (mixer) {
              mixer.stopAllAction();
            }
            // Dispose scene and children
            scene.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.geometry?.dispose();
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => mat.dispose());
                } else {
                  mesh.material?.dispose();
                }
              }
            });
          },
          playAnimation: (nameOrIndex: string | number, loop = true, speed = 1.0) => {
            if (!mixer) return null;

            // Stop all current animations
            for (const action of actions) {
              action.stop();
            }

            let targetAction: THREE.AnimationAction | undefined;

            if (typeof nameOrIndex === 'number') {
              targetAction = actions[nameOrIndex];
            } else {
              // Find by name (case-insensitive partial match)
              const searchName = nameOrIndex.toLowerCase();
              const clipIndex = animations.findIndex((clip) =>
                clip.name.toLowerCase().includes(searchName)
              );
              if (clipIndex >= 0) {
                targetAction = actions[clipIndex];
              }
            }

            if (targetAction) {
              targetAction.setLoop(
                loop ? THREE.LoopRepeat : THREE.LoopOnce,
                loop ? Infinity : 1
              );
              targetAction.timeScale = speed;
              targetAction.reset().fadeIn(0.2).play();
              return targetAction;
            }

            return null;
          },
          stopAllAnimations: () => {
            if (mixer) {
              mixer.stopAllAction();
            }
          },
        });
      },
      (event) => {
        if (onProgress) {
          onProgress({ loaded: event.loaded, total: event.total });
        }
      },
      (error) => {
        console.error('[GLB Loader] Failed to load:', url, error);
        reject(error);
      }
    );
  });
}

/**
 * Preload multiple GLB models
 * Returns a map of URL -> GLBResult
 */
export async function preloadGLBs(
  urls: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, GLBResult>> {
  const results = new Map<string, GLBResult>();
  let loaded = 0;

  for (const url of urls) {
    try {
      const result = await loadGLB({
        url,
        onProgress: () => {
          loaded++;
          onProgress?.(loaded, urls.length);
        },
      });
      results.set(url, result);
    } catch (error) {
      console.error(`[GLB Loader] Failed to preload: ${url}`, error);
    }
  }

  return results;
}

/**
 * Clone a GLB result for instancing
 * Use this when you need multiple instances of the same model
 */
export function cloneGLBResult(original: GLBResult): GLBResult {
  const clonedScene = original.scene.clone();
  const mixer = original.animations.length > 0 ? new THREE.AnimationMixer(clonedScene) : null;
  const actions: THREE.AnimationAction[] = [];

  if (mixer) {
    for (const clip of original.animations) {
      const action = mixer.clipAction(clip);
      actions.push(action);
    }
  }

  return {
    scene: clonedScene,
    animations: original.animations,
    mixer,
    dispose: () => {
      if (mixer) {
        mixer.stopAllAction();
      }
      // Note: Don't dispose geometry/materials as they're shared with original
      // The cloned scene only references the original's geometry and materials
    },
    playAnimation: (nameOrIndex: string | number, loop = true, speed = 1.0) => {
      if (!mixer) return null;

      for (const action of actions) {
        action.stop();
      }

      let targetAction: THREE.AnimationAction | undefined;

      if (typeof nameOrIndex === 'number') {
        targetAction = actions[nameOrIndex];
      } else {
        const searchName = nameOrIndex.toLowerCase();
        const clipIndex = original.animations.findIndex((clip) =>
          clip.name.toLowerCase().includes(searchName)
        );
        if (clipIndex >= 0) {
          targetAction = actions[clipIndex];
        }
      }

      if (targetAction) {
        targetAction.setLoop(
          loop ? THREE.LoopRepeat : THREE.LoopOnce,
          loop ? Infinity : 1
        );
        targetAction.timeScale = speed;
        targetAction.reset().fadeIn(0.2).play();
        return targetAction;
      }

      return null;
    },
    stopAllAnimations: () => {
      if (mixer) {
        mixer.stopAllAction();
      }
    },
  };
}
