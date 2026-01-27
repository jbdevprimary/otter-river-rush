/**
 * Zustand middleware shim that forces CJS import
 * This avoids the import.meta issue in the ESM build
 */

import type * as Middleware from 'zustand/middleware';

// Force require the CJS build directly with typed exports
const middleware = require('zustand/middleware.js') as typeof Middleware;

export const persist = middleware.persist;
export const createJSONStorage = middleware.createJSONStorage;
export const devtools = middleware.devtools;
export const subscribeWithSelector = middleware.subscribeWithSelector;
export const combine = middleware.combine;
export const redux = middleware.redux;
