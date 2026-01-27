/**
 * CloseButton - Branded close icon using atlas texture
 * Uses pre-rendered icon atlas from assets/ui/
 */

import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

// Icon atlas asset
const ICON_ATLAS = require('../../../../assets/ui/icon_close_ATLAS_256x1248.png');

// Atlas metadata
const ICON_METADATA = {
  tileSize: { w: 256, h: 256 },
  atlasSize: { w: 256, h: 1248 },
  topPad: 64,
  gap: 32,
  states: ['idle', 'hover', 'pressed', 'disabled'] as const,
};

type IconState = 'idle' | 'hover' | 'pressed' | 'disabled';

interface CloseButtonProps {
  onPress: () => void;
  size?: number;
  disabled?: boolean;
}

function getStateOffset(state: IconState): { y: number; height: number } {
  const stateIndex = ICON_METADATA.states.indexOf(state);
  const y =
    ICON_METADATA.topPad +
    stateIndex * (ICON_METADATA.tileSize.h + ICON_METADATA.gap);
  return { y, height: ICON_METADATA.tileSize.h };
}

export function CloseButton({
  onPress,
  size = 44,
  disabled = false,
}: CloseButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentState: IconState = disabled
    ? 'disabled'
    : isPressed
      ? 'pressed'
      : isHovered
        ? 'hover'
        : 'idle';

  const stateOffset = getStateOffset(currentState);

  // Calculate scale factor
  const scale = size / ICON_METADATA.tileSize.w;

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={() => !disabled && setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[styles.button, { width: size, height: size }]}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <View style={[styles.imageContainer, { width: size, height: size }]}>
        <Image
          source={ICON_ATLAS as ImageSourcePropType}
          style={[
            styles.atlasImage,
            {
              width: ICON_METADATA.atlasSize.w * scale,
              height: ICON_METADATA.atlasSize.h * scale,
              top: -stateOffset.y * scale,
            },
          ]}
          resizeMode="stretch"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 8,
  },
  atlasImage: {
    position: 'absolute',
    left: 0,
  },
});

export default CloseButton;
