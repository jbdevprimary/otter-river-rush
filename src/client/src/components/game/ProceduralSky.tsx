import { useMemo } from 'react';
import * as THREE from 'three';
import { useBiome } from '../../ecs/biome-system';

export function ProceduralSky() {
    const biome = useBiome();
    const skyMaterial = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grd.addColorStop(0, '#0b1220');
        grd.addColorStop(0.5, biome.fogColor);
        grd.addColorStop(1, '#000000');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        return new THREE.MeshBasicMaterial({ map: texture, transparent: false });
    }, [biome]);

    return (
        <mesh position={[0, 12, -6]}>
            <planeGeometry args={[60, 30]} />
            <primitive object={skyMaterial} attach="material" />
        </mesh>
    );
}

