/**
 * River Environment Component
 * Creates the water/river visual with animated flow and parallax backgrounds
 * Optimized for ENDLESS RUNNER perspective (camera behind player, looking forward)
 *
 * Coordinate System:
 * - X: left/right (lanes at -2, 0, 2)
 * - Y: forward/back (river direction - player at -3, obstacles spawn at 8)
 * - Z: up/down (height - ground at 0)
 */

import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import {
  MeshBuilder,
  StandardMaterial,
  Texture,
  Color3,
  type Mesh,
} from '@babylonjs/core';
import { VISUAL, BIOME_COLORS } from '@otter-river-rush/config';

interface RiverEnvironmentProps {
  biome?: keyof typeof BIOME_COLORS;
}

export function RiverEnvironment({ biome = 'forest' }: RiverEnvironmentProps) {
  const scene = useScene();
  const meshesRef = useRef<Mesh[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!scene) return;

    const meshes: Mesh[] = [];
    const colors = BIOME_COLORS[biome];

    // River dimensions
    const riverWidth = 8; // Width of water (X axis)
    const riverLength = 50; // Length of river (Y axis - into distance)
    const bankWidth = 6; // Width of each bank

    // ===================
    // RIVER/WATER SURFACE
    // ===================
    // Ground plane in X-Y at Z=0 (ground level)
    const riverGround = MeshBuilder.CreateGround(
      'riverGround',
      { width: riverWidth, height: riverLength, subdivisions: 32 },
      scene
    );
    // Rotate to lie in X-Y plane (default is X-Z)
    riverGround.rotation.x = Math.PI / 2;
    riverGround.position.set(0, riverLength / 2 - 10, -0.1); // Extend forward from behind player

    const waterMat = new StandardMaterial('waterMat', scene);
    waterMat.diffuseColor = Color3.FromHexString(colors.water);
    waterMat.specularColor = new Color3(0.3, 0.3, 0.4);
    waterMat.emissiveColor = Color3.FromHexString(colors.water).scale(0.1);

    // Add water texture for ripple effect
    try {
      const waterTexture = new Texture('https://playground.babylonjs.com/textures/waterbump.png', scene);
      waterTexture.uScale = 4;
      waterTexture.vScale = 8;
      waterMat.bumpTexture = waterTexture;
    } catch {
      // Fallback to solid color
    }

    riverGround.material = waterMat;
    meshes.push(riverGround);

    // ===================
    // LEFT RIVERBANK
    // ===================
    const leftBank = MeshBuilder.CreateGround(
      'leftBank',
      { width: bankWidth, height: riverLength },
      scene
    );
    leftBank.rotation.x = Math.PI / 2;
    leftBank.position.set(-(riverWidth / 2 + bankWidth / 2), riverLength / 2 - 10, 0);

    const leftBankMat = new StandardMaterial('leftBankMat', scene);
    leftBankMat.diffuseColor = Color3.FromHexString(colors.terrain);
    leftBankMat.specularColor = new Color3(0, 0, 0);
    leftBank.material = leftBankMat;
    meshes.push(leftBank);

    // ===================
    // RIGHT RIVERBANK
    // ===================
    const rightBank = MeshBuilder.CreateGround(
      'rightBank',
      { width: bankWidth, height: riverLength },
      scene
    );
    rightBank.rotation.x = Math.PI / 2;
    rightBank.position.set(riverWidth / 2 + bankWidth / 2, riverLength / 2 - 10, 0);

    const rightBankMat = new StandardMaterial('rightBankMat', scene);
    rightBankMat.diffuseColor = Color3.FromHexString(colors.terrain);
    rightBankMat.specularColor = new Color3(0, 0, 0);
    rightBank.material = rightBankMat;
    meshes.push(rightBank);

    // ===================
    // TREES ALONG BANKS
    // ===================
    const treePositions = [
      // Left side trees (various Y positions along the river)
      { x: -6, y: -5, scale: 1.2 },
      { x: -7, y: 0, scale: 1.0 },
      { x: -5.5, y: 5, scale: 1.4 },
      { x: -6.5, y: 10, scale: 0.9 },
      { x: -7, y: 15, scale: 1.1 },
      { x: -5.5, y: 20, scale: 1.3 },
      { x: -6, y: 25, scale: 1.0 },
      { x: -7, y: 30, scale: 1.2 },
      // Right side trees
      { x: 6, y: -3, scale: 1.1 },
      { x: 7, y: 2, scale: 0.9 },
      { x: 5.5, y: 7, scale: 1.3 },
      { x: 6.5, y: 12, scale: 1.0 },
      { x: 7, y: 17, scale: 1.2 },
      { x: 5.5, y: 22, scale: 1.1 },
      { x: 6, y: 27, scale: 1.4 },
      { x: 7, y: 32, scale: 0.9 },
    ];

    treePositions.forEach((pos, i) => {
      const scale = pos.scale;

      // Tree trunk (standing up along Z axis)
      const trunk = MeshBuilder.CreateCylinder(`trunk${i}`, {
        height: 2 * scale,
        diameter: 0.4 * scale,
      }, scene);
      trunk.position.set(pos.x, pos.y, 1 * scale);
      const trunkMat = new StandardMaterial(`trunkMat${i}`, scene);
      trunkMat.diffuseColor = new Color3(0.35, 0.2, 0.1);
      trunk.material = trunkMat;
      meshes.push(trunk);

      // Tree foliage (cone shape pointing up)
      const foliage = MeshBuilder.CreateCylinder(`foliage${i}`, {
        height: 3 * scale,
        diameterTop: 0,
        diameterBottom: 2 * scale,
      }, scene);
      foliage.position.set(pos.x, pos.y, 3.5 * scale);
      const foliageMat = new StandardMaterial(`foliageMat${i}`, scene);
      foliageMat.diffuseColor = Color3.FromHexString(colors.terrain || '#166534');
      foliage.material = foliageMat;
      meshes.push(foliage);
    });

    // ===================
    // DISTANT MOUNTAINS (background)
    // ===================
    const mountainPositions = [
      { x: -15, y: 40, height: 12, width: 16 },
      { x: -8, y: 45, height: 8, width: 12 },
      { x: 0, y: 50, height: 15, width: 20 },
      { x: 10, y: 42, height: 10, width: 14 },
      { x: 18, y: 48, height: 13, width: 18 },
    ];

    mountainPositions.forEach((m, i) => {
      const mountain = MeshBuilder.CreateCylinder(
        `mountain${i}`,
        { height: m.height, diameterTop: 0, diameterBottom: m.width },
        scene
      );
      mountain.position.set(m.x, m.y, m.height / 2 - 2);
      const mountainMat = new StandardMaterial(`mountainMat${i}`, scene);
      mountainMat.diffuseColor = Color3.FromHexString('#475569');
      mountainMat.specularColor = new Color3(0, 0, 0);
      mountain.material = mountainMat;
      meshes.push(mountain);
    });

    // ===================
    // SKY BACKDROP
    // ===================
    const sky = MeshBuilder.CreatePlane('sky', { width: 80, height: 40 }, scene);
    sky.position.set(0, 55, 10); // Far in the distance, elevated
    sky.rotation.x = -Math.PI / 6; // Tilt back slightly
    const skyMat = new StandardMaterial('skyMat', scene);
    skyMat.diffuseColor = Color3.FromHexString(colors.sky);
    skyMat.emissiveColor = Color3.FromHexString(colors.sky).scale(0.5);
    skyMat.specularColor = new Color3(0, 0, 0);
    skyMat.backFaceCulling = false;
    sky.material = skyMat;
    meshes.push(sky);

    // ===================
    // LANE MARKERS (subtle guide lines on water)
    // ===================
    VISUAL.lanes.positions.forEach((laneX, i) => {
      const laneMarker = MeshBuilder.CreateBox(`laneMarker${i}`, {
        width: 0.08,
        height: riverLength,
        depth: 0.02,
      }, scene);
      laneMarker.rotation.x = Math.PI / 2;
      laneMarker.position.set(laneX, riverLength / 2 - 10, 0);
      const laneMat = new StandardMaterial(`laneMat${i}`, scene);
      laneMat.diffuseColor = new Color3(1, 1, 1);
      laneMat.alpha = 0.2;
      laneMat.emissiveColor = new Color3(0.3, 0.3, 0.4);
      laneMarker.material = laneMat;
      meshes.push(laneMarker);
    });

    // ===================
    // ANIMATED WATER FLOW EFFECT
    // ===================
    let time = 0;
    const animate = () => {
      time += 0.016;

      // Animate water texture offset for flow effect
      if (waterMat.bumpTexture) {
        (waterMat.bumpTexture as Texture).vOffset -= 0.005; // Flow toward player
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    meshesRef.current = meshes;

    return () => {
      cancelAnimationFrame(animationRef.current);
      meshes.forEach(mesh => mesh.dispose());
    };
  }, [scene, biome]);

  return null;
}
