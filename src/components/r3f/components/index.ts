export * from './EntityRenderer';
export * from './GameCanvas';
export * from './GameLoop';
export * from './WaterSurface';
export * from './WeatherEffects';
// RiverEnvironment is likely legacy or misplaced if it's here, but if I saw it in ls, I might as well leave it or ignore it for now to avoid breaking other things, but I should probably NOT export it if I'm using the App one.
// However, if other parts of the app use it, removing it from export might break them.
// Given I just extracted it to App.tsx, the one in rendering might be an old version or one I should have used?
// The user said "Extract RiverEnvironment to apps/web/...". This implies it was inside App.tsx (which it was).
// So the one in `packages/rendering` might be dead code or a previous attempt?
// I will NOT export it to avoid conflicts with my new one, unless I am sure.
// Actually, safely exporting it as named export implies no conflict unless names clash.
// But I need `BiomeWeather` which is likely in `WeatherEffects`.
