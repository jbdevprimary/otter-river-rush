# Landing Page & UI System Specification

## Goal
Transform the flat, lifeless main menu into an immersive 3D character selection experience with branded 9-slice UI components.

**User Flow**: Splash Screen → 3D Otter Carousel (character selection) → Game

---

## Part A: 3D Otter Character Carousel

### A.1 Layout
- Half-ring layout with center otter on lit pedestal
- Swipe/arrow navigation between characters
- Portrait mode: single otter view
- Landscape mode: 3 otters visible (center + 2 flanking)

### A.2 Components Created
| Component | Purpose |
|-----------|---------|
| `CharacterCarousel3D` | Main R3F Canvas wrapper, camera at [0, 2, 8], FOV 50 |
| `CarouselStage` | 3D scene positioning (center, back-left, back-right otters) |
| `OtterModelPreview` | GLB loader with locked/unlocked states |
| `ProceduralPedestal` | Hexagonal platform with gold ring |
| `CarouselLighting` | Spotlight + ambient lighting |
| `CarouselAnimationController` | Animation state management |
| `useCarouselRotation` | Hook for rotation state (300ms animation) |

### A.3 Camera Settings
- Position: [0, 2, 8]
- FOV: 50
- Transparent background for UI layering
- ACES Filmic tone mapping

### A.4 Character States
- **Unlocked**: Full color, idle animation, spotlight active
- **Locked**: Grayscale material + lock icon overlay + unlock hint text

### A.5 Navigation
- Keyboard: ArrowLeft/ArrowRight
- Touch: Swipe gestures
- Animation: 300ms eased rotation

---

## Part B: 9-Slice UI System

### B.1 Components
| Component | Purpose |
|-----------|---------|
| `NineSliceSprite` | Core 9-slice renderer (9 Images) |
| `NineSliceButton` | Button with state machine |
| `NineSlicePanel` | Panel container |
| `CloseIconButton` | Close button sprite |
| `SettingsModal` | Branded settings modal |
| `PowerUpsGalleryModal` | Power-ups grid display |

### B.2 Button Variants
1. **Primary** - Main action buttons (blue/teal gradient)
2. **Secondary** - Alternative actions (brown/tan)
3. **Ghost/Tertiary** - Subtle actions (transparent with border)

### B.3 Button State Machine
```
idle → hover (pointerenter)
idle → pressed (pointerdown/touchstart)
hover → pressed (pointerdown)
pressed → click → idle (pointerup inside)
pressed → hover (pointerup outside while hovering)
pressed → idle (pointerup outside)
any → disabled (disabled prop)
```

### B.4 Atlas Assets
Location: `assets/ui/`

| File | Description |
|------|-------------|
| `button_primary_9slice_v3_ATLAS_1024x1408.png` | Primary button atlas |
| `button_secondary_9slice_v3_ATLAS_1024x1408.png` | Secondary button atlas |
| `button_tertiary_ghost_9slice_v3_ATLAS_1024x1408.png` | Ghost button atlas |
| `panel_menu_9slice_v3_ATLAS_1024x1248.png` | Panel background atlas |
| `icon_close_ATLAS_256x1248.png` | Close icon atlas |
| `*_metadata.json` | Atlas slice coordinates |

### B.5 Brand Assets
Location: `assets/branding/`

| File | Description |
|------|-------------|
| `logo.png` | Rusty logo/mascot |
| `splash.png` | Splash screen image |
| `portrait.png` | Character portrait |

---

## Part C: Screen Integration

### C.1 CharacterSelectScreen
- Combines 3D carousel (full background) with 2D overlay
- Character info card at bottom
- Navigation arrows and dot indicators
- START GAME button (disabled if character locked)
- BACK button to main menu

### C.2 MainMenu Flow
```
MainMenu
  ├── "LET'S DIVE IN!" → Start game with selected character
  ├── "SELECT OTTER" → CharacterSelectScreen (3D carousel)
  └── "SETTINGS" → SettingsModal
```

---

## Part D: Brand Identity Integration

### D.1 Color Palette (from BRAND_IDENTITY.md)
```typescript
// Rusty's Colors
otterBrown: '#8B5A3C'
otterCream: '#F4E4C1'
otterDark: '#5C3A29'

// Water Colors
riverBlue: '#4A9ECD'
riverLight: '#7FCCF7'
riverDark: '#2E6B8F'

// UI/Feedback
coinGold: '#FFD700'
successGreen: '#4CAF50'
dangerRed: '#F44336'
```

### D.2 Typography
- Titles: Bold, white with text shadow
- Body: Regular, light cream color
- Buttons: Bold, white, centered

### D.3 Voice & Tone
- Playful puns ("otterly unstoppable!")
- Encouraging ("What a run!")
- Water/nature themed ("Let's dive in!")

---

## Implementation Status

### Completed
- [x] 3D Carousel components created
- [x] CharacterSelectScreen with carousel integration
- [x] Brand assets copied to assets/branding/ and assets/ui/
- [x] app.json configured with branded splash screen
- [x] tailwind.config.js updated with brand colors
- [x] Basic NineSliceButton, NineSlicePanel, CloseButton components

### Pending
- [ ] Full 9-slice atlas sprite sheet rendering
- [ ] SettingsModal with branded panel
- [ ] PowerUpsGalleryModal
- [ ] MainMenu using branded buttons throughout
- [ ] Animated button hover/press states
- [ ] Landing page with animated Rusty hero
