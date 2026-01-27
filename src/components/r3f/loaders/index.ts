/**
 * Asset loaders
 *
 * NOTE: For React Three Fiber components, prefer using useGLTF directly from @react-three/drei
 * These utilities are for imperative loading outside of React components
 */

export { type GLBResult, type LoadGLBOptions, loadGLB, preloadGLBs, cloneGLBResult } from './glb-loader';
