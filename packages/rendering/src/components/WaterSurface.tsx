import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { AnimatedWaterMaterial } from '../shaders/WaterMaterial';

// For Metro web, assets are served from public/ at root
const BASE_URL = '';

interface WaterSurfaceProps {
    colors: {
        water: string | THREE.Color;
        deep: string | THREE.Color;
        foam: string | THREE.Color;
    };
    foamColor: string;
    baseUrl?: string;
    /** Width of the river (reserved for future use) */
    riverWidth?: number;
    /** Length of the river (reserved for future use) */
    riverLength?: number;
}

export function WaterSurface({
    colors,
    foamColor,
    baseUrl = BASE_URL,
}: WaterSurfaceProps) {
    // Load textures
    const [normalMap, roughnessMap] = useTexture([
        `${baseUrl}/textures/water/water_normal.jpg`,
        `${baseUrl}/textures/water/water_roughness.jpg`,
    ]);

    // Configure textures
    useMemo(() => {
        if (normalMap) {
            normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
            normalMap.repeat.set(4, 20); // Repeat along the river
        }
        if (roughnessMap) {
            roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
            roughnessMap.repeat.set(4, 20);
        }
    }, [normalMap, roughnessMap]);

    // Convert colors to hex strings for the shader material props
    // The shader material props are typed as string (optional) in AnimatedWaterMaterial interface
    const toHex = (c: string | THREE.Color) => (c instanceof THREE.Color ? `#${c.getHexString()}` : c);

    return (
        <AnimatedWaterMaterial
            waterColor={toHex(colors.water)}
            deepColor={toHex(colors.deep)}
            foamColor={toHex(foamColor)}
            waveHeight={0.06}
            waveFrequency={0.4}
            waveSpeed={1.2}
            flowSpeed={0.12}
            fresnelPower={2.0}
            opacity={0.85}
            normalMap={normalMap}
            roughnessMap={roughnessMap}
        />
    );
}
