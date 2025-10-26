/**
 * Type definitions for nipplejs
 * https://github.com/yoannmoinet/nipplejs
 */

declare module 'nipplejs' {
  export interface JoystickOutputData {
    position: { x: number; y: number };
    force: number;
    distance: number;
    pressure: number;
    angle?: {
      radian: number;
      degree: number;
    };
    direction?: {
      x: 'left' | 'right';
      y: 'up' | 'down';
      angle: string;
    };
    instance: JoystickManager;
  }

  export type EventData = JoystickOutputData;

  export interface JoystickManagerOptions {
    zone?: Element;
    color?: string;
    size?: number;
    threshold?: number;
    fadeTime?: number;
    multitouch?: boolean;
    maxNumberOfNipples?: number;
    dataOnly?: boolean;
    position?: { top?: string; left?: string; right?: string; bottom?: string };
    mode?: 'static' | 'semi' | 'dynamic';
    restJoystick?: boolean;
    restOpacity?: number;
    lockX?: boolean;
    lockY?: boolean;
    catchDistance?: number;
    shape?: 'circle' | 'square';
    dynamicPage?: boolean;
    follow?: boolean;
  }

  export interface JoystickManager {
    on(
      event:
        | 'start'
        | 'end'
        | 'move'
        | 'dir'
        | 'plain'
        | 'shown'
        | 'hidden'
        | 'pressure'
        | 'added'
        | 'removed',
      handler: (evt: unknown, data: EventData) => void
    ): void;
    off(event: string): void;
    destroy(): void;
    get(id: number): unknown;
  }

  export function create(options: JoystickManagerOptions): JoystickManager;

  export default { create };
}
