/**
 * Zustand middleware shim that forces CJS import
 * This avoids the import.meta issue in the ESM build
 */

// Force require the CJS build directly
const middleware = require('zustand/middleware.js');

export const persist = middleware.persist;
export const createJSONStorage = middleware.createJSONStorage;
export const devtools = middleware.devtools;
export const subscribeWithSelector = middleware.subscribeWithSelector;
export const combine = middleware.combine;
export const redux = middleware.redux;
