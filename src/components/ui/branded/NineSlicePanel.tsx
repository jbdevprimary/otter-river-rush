/**
 * NineSlicePanel - Branded panel using 9-slice atlas texture
 * Uses pre-rendered panel atlas from assets/ui/
 */

import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

// Panel atlas asset
const PANEL_ATLAS = require('../../../../assets/ui/panel_menu_9slice_v3_ATLAS_1024x1248.png');

// Atlas metadata
const PANEL_METADATA = {
  tileSize: { w: 1024, h: 512 },
  atlasSize: { w: 1024, h: 1248 },
  topPad: 64,
  gap: 96,
  states: ['idle', 'disabled'] as const,
  contentInsets: {
    left: 128,
    right: 128,
    top: 128,
    bottom: 128,
  },
};

type PanelState = 'idle' | 'disabled';

interface NineSlicePanelProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  state?: PanelState;
  style?: ViewStyle;
}

function getStateOffset(state: PanelState): { y: number; height: number } {
  const stateIndex = PANEL_METADATA.states.indexOf(state);
  const y =
    PANEL_METADATA.topPad +
    stateIndex * (PANEL_METADATA.tileSize.h + PANEL_METADATA.gap);
  return { y, height: PANEL_METADATA.tileSize.h };
}

export function NineSlicePanel({
  children,
  width = 400,
  height = 300,
  state = 'idle',
  style,
}: NineSlicePanelProps) {
  const stateOffset = getStateOffset(state);

  // Calculate scale factor for the panel
  const scaleX = width / PANEL_METADATA.tileSize.w;
  const scaleY = height / PANEL_METADATA.tileSize.h;

  // Calculate content padding based on scaled insets
  const contentPadding = {
    paddingLeft: PANEL_METADATA.contentInsets.left * scaleX * 0.4,
    paddingRight: PANEL_METADATA.contentInsets.right * scaleX * 0.4,
    paddingTop: PANEL_METADATA.contentInsets.top * scaleY * 0.4,
    paddingBottom: PANEL_METADATA.contentInsets.bottom * scaleY * 0.4,
  };

  return (
    <View style={[styles.panel, { width, height }, style]}>
      {/* Background image clipped to show current state */}
      <View style={[styles.imageContainer, { width, height }]}>
        <Image
          source={PANEL_ATLAS as ImageSourcePropType}
          style={[
            styles.atlasImage,
            {
              width: PANEL_METADATA.atlasSize.w * scaleX,
              height: PANEL_METADATA.atlasSize.h * scaleY,
              top: -stateOffset.y * scaleY,
            },
          ]}
          resizeMode="stretch"
        />
      </View>

      {/* Panel content */}
      <View style={[styles.content, contentPadding]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 24,
  },
  imageContainer: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 24,
  },
  atlasImage: {
    position: 'absolute',
    left: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default NineSlicePanel;
