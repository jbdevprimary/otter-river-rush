# Otter River Rush — Agentic Usage Guide (UI + Splash Video)

This document is written for an **agentic code assistant** (and humans) to implement the generated UI kit and splash video pipeline with minimal back-and-forth. It assumes a React + React-Three-Fiber (R3F) stack, and prioritizes **mobile-first** targets spanning **Pixel 8a → Pixel Tablet → desktop/laptop**.

---

## 0) Primary Objectives

1. **Ship-ready UI rendering** using 9-slice assets (buttons, panels, header plate) with consistent interaction states.
2. **Reliable touch + pointer interactions** with predictable hit regions.
3. **Responsive scaling** across phone/tablet/desktop, with layout safe areas.
4. **Splash video generation** (Vmake Image→Video, Kling O1) as a background loop, while overlaying UI elements in-engine (avoid AI text/logo drift).

---

## 1) Asset Inventory (Current Generated Kit)

### 9-slice Buttons (v3)
- Primary: wood + river-blue face + splash accents  
  - Atlas: `button_primary_9slice_v3_ATLAS_1024x1408.png`
  - Meta:  `button_primary_9slice_v3_metadata.json`

- Secondary: wood + green face + leaf accents  
  - Atlas: `button_secondary_9slice_v3_ATLAS_1024x1408.png`
  - Meta:  `button_secondary_9slice_v3_metadata.json`

- Tertiary “Ghost”: wood frame + translucent face + splash accents  
  - Atlas: `button_tertiary_ghost_9slice_v3_ATLAS_1024x1408.png`
  - Meta:  `button_tertiary_ghost_9slice_v3_metadata.json`

### 9-slice Panels
- Menu panel: wood frame + parchment interior  
  - Atlas: `panel_menu_9slice_v3_ATLAS_1024x1248.png`
  - Meta:  `panel_menu_9slice_v3_metadata.json`

### Icons
- Close button icon set (idle/hover/pressed/disabled)  
  - Atlas: `icon_close_ATLAS_256x1248.png`
  - Meta:  `icon_close_metadata.json`

### Manifests
- `manifest.json` (kit-level listing)

**Expected atlas layout:** vertical stack of tiles with `top_pad` and `gap` values defined in each metadata file.

---

## 2) Canonical Rendering Strategy

### Recommended: “DOM overlay for interaction + WebGL for art” (Hybrid)
**Why:**
- DOM gives perfect text rendering, accessibility, and consistent click/touch behavior.
- WebGL renders the brand-art UI surfaces and blends them with the 3D world.

**Rule:**  
- Do NOT bake text into generated videos or textures.  
- Render all text as DOM (`<button>`, `<div>`) or as SDF text (Troika) if you must stay in WebGL.

### Alternate: “All WebGL UI”
Use only if you require UI to be part of 3D scene effects. If you go this route:
- keep hitboxes as separate invisible planes
- use Troika SDF text for labels

---

## 3) 9-Slice Implementation Requirements

### 3.1 Inputs
Each `*_metadata.json` provides:
- `tile_size` (w,h)
- `states` (tile order)
- `atlas` with `top_pad`, `gap`, `atlas_w`, `atlas_h`
- `nine_slice_insets_px` (left/right/top/bottom)
- optional safe rects (`inner_text_rect_insets_px`, `content_rect_insets_px`, etc.)

### 3.2 Output
A 9-slice renderer should produce 9 quads (or 9 DOM layers) that:
- keep corners at fixed pixel size
- stretch edges in one axis
- stretch center in both axes

### 3.3 Texture sampling safeguards
- Use **clamp-to-edge** wrapping.
- Use **padding / avoid bleeding**: since tiles are separated by gaps, ensure UVs never sample outside the tile rect.
- If you see seams: bias UVs inward by ~0.5–1 texel.

---

## 4) Interaction Model (Non-Negotiable)

### 4.1 Separate the visual from the hitbox
For each button:
- Visual: 9-slice art (WebGL plane(s) or DOM layers)
- Hitbox: an **invisible** rectangle used for pointer/touch events

**Minimum tap target:** 48×48 dp equivalent.

### 4.2 State machine (required)
`idle → hover → pressed → (click) → idle`
`disabled` overrides all.

Pointer logic:
- `pointerenter` => hover (desktop)
- `pointerdown` => pressed
- `pointerup` + still over button => click + hover
- `pointerleave` => idle (unless pressed; then cancel)

Mobile logic:
- `touchstart` => pressed
- `touchend` => click if release inside hitbox
- do not rely on hover

---

## 5) Responsive Layout Targets

### 5.1 Breakpoints (recommendation)
- Phone: width < 600dp (Pixel 8a class)
- Tablet: 600–1023dp (Pixel Tablet class)
- Desktop: ≥ 1024dp

### 5.2 Button sizing guidance
Use metadata insets + clamp UI sizes:
- Phone: height ~56dp, max width ~360dp
- Tablet: height ~72dp, max width ~520dp
- Desktop: height ~64dp, max width ~420dp

### 5.3 Safe areas
Always apply:
- `env(safe-area-inset-*)` on mobile (iOS especially).
- add padding around edges: 16dp phone, 24dp tablet/desktop.

---

## 6) Practical Wiring for an Agent

### 6.1 Load metadata + compute tile rects
For each state tile index `i` in `states`:
- `tileW = meta.tile_size.w`
- `tileH = meta.tile_size.h`
- `y = meta.atlas.top_pad + i*(tileH + meta.atlas.gap)`
- Tile UV rect:  
  - `u0=0/atlasW, u1=tileW/atlasW`  
  - `v0=y/atlasH, v1=(y+tileH)/atlasH`

### 6.2 Apply 9-slice insets
Given insets L,R,T,B in px:
- Corner sizes are fixed in px terms **relative to source tile**
- When rendering at target size (W,H), allocate:
  - left = min(L, W/2)
  - right = min(R, W/2)
  - top = min(T, H/2)
  - bottom = min(B, H/2)

### 6.3 Text safe area (if provided)
Use `inner_text_rect_insets_px` to define a text box:
- `textBox.x = leftInset`
- `textBox.y = topInset`
- `textBox.w = tileW - leftInset - rightInset`
- `textBox.h = tileH - topInset - bottomInset`
Scale proportionally to rendered button size.

---

## 7) Recommended UI Composition

### Main Menu
- Background: splash loop video (or static image)
- Foreground: panel 9-slice (menu container)
- Inside panel: vertical stack of primary/secondary buttons
- Header: modal header plate + close icon for submenus

### In-Game HUD
- Use ghost buttons for light actions
- Use primary for “pause” / “primary action”
- Keep UI high contrast against moving background (consider a subtle dark overlay behind text)

---

## 8) Splash Video Pipeline (Vmake / Kling O1)

### 8.1 Strong recommendation
Generate **background-only loop**:
- no text
- no logos
- no UI elements

Overlay masthead/logo/buttons in-engine.

### 8.2 Kling O1 prompt (≤1500 chars)
Use the following as the description:
> Using the provided image as the exact style and character reference, create a 15-second seamless looping splash animation for a bright, playful mobile game. Keep Rusty the river otter perfectly consistent: same face, fur colors, goggles, life vest, proportions, expression, and outline style. Animate lively but controlled river motion: sparkling water flow, foam, small splashes, drifting bubbles, and subtle floating collectibles (coins/gems) that gently bob without changing design. Add a slow, smooth camera drift (very subtle push-in and slight left-to-right parallax), maintaining stable framing so the character remains clear and centered. Background scenery (mountains/trees/rocks/waterfall) stays consistent with light parallax only. Lighting: sunny midday, saturated but not neon, soft highlights on water, no dramatic color shifts. Motion should be clean and stable: no jitter, no flicker, no warping. Create a perfect loop: end frame matches start frame (water/foam cycles, collectibles return to starting positions). IMPORTANT: do not generate any text, logos, UI, or buttons—leave clean space for overlay.

### 8.3 Negative prompt (≤1500 chars)
> text, letters, words, typography, logo, watermark, subtitle, caption, UI, button, menu, HUD, interface, frame, border, corrupted text, illegible text, brand drift, character morphing, face changing, goggles changing, vest changing, extra limbs, missing limbs, deformed paws, uncanny face, color shifting, palette shift, style shift, realism, photoreal, motion blur heavy, camera shake, fast zoom, strobe, flicker, jitter, temporal wobble, warping, melting, smearing, ghosting, noisy grain, pixelation, banding, compression artifacts, chromatic aberration, popping objects, teleporting collectibles, unstable outlines.

### 8.4 Aspect ratio guidance
- Generate **9:16 first** (mobile splash).
- Then generate 16:9 and 1:1 separately if needed (best), or crop from 9:16 (faster).

---

## 9) Agent Task Checklist

### Implement UI kit
- [ ] Load JSON metadata for each atlas
- [ ] Build a `NineSliceSprite` renderer (DOM or WebGL)
- [ ] Implement `Button` component with state machine + separate hitbox
- [ ] Implement `Panel` component for menus
- [ ] Implement `HeaderPlate` + `CloseButton`
- [ ] Apply responsive sizing rules and safe areas
- [ ] Validate on Pixel 8a viewport + Pixel Tablet viewport + desktop

### Validate quality
- [ ] Confirm no UV bleeding between tiles
- [ ] Confirm corners remain crisp at min/max sizes
- [ ] Confirm tap targets meet 48×48 minimum
- [ ] Confirm disabled state blocks events
- [ ] Confirm text remains readable over splash loop

---

## 10) Known Pitfalls & Fixes

### Seams on 9-slice edges
- Clamp wrapping
- Inset UVs inward by 0.5–1 texel
- Ensure mipmaps aren’t sampling across gaps (consider disabling mipmaps for UI textures)

### “Flat look” over bright backgrounds
- Add a subtle dark translucent scrim behind menu panels (10–25% black)
- Increase label text shadow / outline

### Text alignment mismatch across scales
- Use the provided `inner_text_rect_insets_px` and scale it with the button size

---

## Appendix A — File Paths (Sandbox)
When working in this environment, the files may exist under `/mnt/data/`. In your repo, place them under something like:
- `public/ui/otter/` (web)
- or an asset pipeline folder and load them via your bundler.

---

**End of document**
