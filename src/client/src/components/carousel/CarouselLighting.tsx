/**
 * CarouselLighting Component
 * Stage lighting setup for the character carousel
 *
 * Provides:
 * - Focused spotlight on center character
 * - Dimmer point lights for side characters
 * - Ambient fill light
 */

export interface CarouselLightingProps {
  /** Intensity of the center spotlight */
  centerIntensity?: number;
  /** Intensity of the side point lights */
  sideIntensity?: number;
  /** Ambient light intensity */
  ambientIntensity?: number;
}

export function CarouselLighting({
  centerIntensity = 2.5,
  sideIntensity = 0.8,
  ambientIntensity = 0.4,
}: CarouselLightingProps) {
  return (
    <>
      {/* Ambient fill light for overall illumination */}
      <ambientLight intensity={ambientIntensity} color="#ffffff" />

      {/* Main spotlight on center position - from above and slightly front */}
      <spotLight
        position={[0, 6, 4]}
        angle={Math.PI / 6}
        penumbra={0.5}
        intensity={centerIntensity}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        target-position={[0, 0, 2]}
      />

      {/* Secondary spotlight for rim lighting from behind */}
      <spotLight
        position={[0, 4, -2]}
        angle={Math.PI / 5}
        penumbra={0.7}
        intensity={centerIntensity * 0.4}
        color="#87ceeb"
        target-position={[0, 0, 2]}
      />

      {/* Left side point light - dimmer, warm */}
      <pointLight
        position={[-4, 3, 1]}
        intensity={sideIntensity}
        color="#ffeedd"
        distance={8}
        decay={2}
      />

      {/* Right side point light - dimmer, cool */}
      <pointLight
        position={[4, 3, 1]}
        intensity={sideIntensity}
        color="#ddeeff"
        distance={8}
        decay={2}
      />

      {/* Ground bounce light - subtle upward fill */}
      <pointLight
        position={[0, -1, 2]}
        intensity={ambientIntensity * 0.5}
        color="#4a3728"
        distance={4}
        decay={2}
      />

      {/* Hemisphere light for natural gradient */}
      <hemisphereLight color="#87ceeb" groundColor="#4a3728" intensity={ambientIntensity * 0.6} />
    </>
  );
}
