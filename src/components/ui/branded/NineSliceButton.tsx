/**
 * NineSliceButton - Branded button using 9-slice atlas textures
 * Uses pre-rendered button atlases from assets/ui/
 */

import { useState } from 'react';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

// Button atlas assets
const BUTTON_ATLASES = {
  primary: require('../../../../assets/ui/button_primary_9slice_v3_ATLAS_1024x1408.png'),
  secondary: require('../../../../assets/ui/button_secondary_9slice_v3_ATLAS_1024x1408.png'),
  ghost: require('../../../../assets/ui/button_tertiary_ghost_9slice_v3_ATLAS_1024x1408.png'),
} as const;

// Atlas metadata for each button type
const BUTTON_METADATA = {
  primary: {
    tileSize: { w: 1024, h: 256 },
    atlasSize: { w: 1024, h: 1408 },
    topPad: 96,
    gap: 64,
    states: ['idle', 'hover', 'pressed', 'disabled'] as const,
  },
  secondary: {
    tileSize: { w: 1024, h: 256 },
    atlasSize: { w: 1024, h: 1408 },
    topPad: 96,
    gap: 64,
    states: ['idle', 'hover', 'pressed', 'disabled'] as const,
  },
  ghost: {
    tileSize: { w: 1024, h: 256 },
    atlasSize: { w: 1024, h: 1408 },
    topPad: 96,
    gap: 64,
    states: ['idle', 'hover', 'pressed', 'disabled'] as const,
  },
};

type ButtonVariant = keyof typeof BUTTON_ATLASES;
type ButtonState = 'idle' | 'hover' | 'pressed' | 'disabled';

interface NineSliceButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

function getStateOffset(variant: ButtonVariant, state: ButtonState): { y: number; height: number } {
  const meta = BUTTON_METADATA[variant];
  const stateIndex = meta.states.indexOf(state);
  const y = meta.topPad + stateIndex * (meta.tileSize.h + meta.gap);
  return { y, height: meta.tileSize.h };
}

export function NineSliceButton({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  width = 280,
  height = 60,
}: NineSliceButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentState: ButtonState = disabled
    ? 'disabled'
    : isPressed
      ? 'pressed'
      : isHovered
        ? 'hover'
        : 'idle';

  const meta = BUTTON_METADATA[variant];
  const stateOffset = getStateOffset(variant, currentState);
  const atlasSource = BUTTON_ATLASES[variant];

  // Calculate scale factor for the button
  const scaleX = width / meta.tileSize.w;
  const scaleY = height / meta.tileSize.h;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={() => !disabled && setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.button, { width, height }]}
    >
      {/* Background image clipped to show current state */}
      <View style={[styles.imageContainer, { width, height }]}>
        <Image
          source={atlasSource as ImageSourcePropType}
          style={[
            styles.atlasImage,
            {
              width: meta.atlasSize.w * scaleX,
              height: meta.atlasSize.h * scaleY,
              top: -stateOffset.y * scaleY,
            },
          ]}
          resizeMode="stretch"
        />
      </View>

      {/* Button content */}
      <View style={styles.content}>
        {typeof children === 'string' ? <Text style={styles.text}>{children}</Text> : children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 16,
  },
  atlasImage: {
    position: 'absolute',
    left: 0,
  },
  content: {
    zIndex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default NineSliceButton;
