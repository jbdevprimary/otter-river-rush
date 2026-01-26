/**
 * Type declarations for React Three Fiber in React Native
 * Extends JSX.IntrinsicElements with Three.js element types
 */

import type { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
