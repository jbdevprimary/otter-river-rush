const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Transform zustand/middleware to handle import.meta.env
// By default, Metro doesn't transform node_modules, but zustand uses import.meta
config.transformer = {
  ...config.transformer,
  // Force transformation of specific node_modules that use import.meta
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Add zustand to the list of modules that need transformation
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];

// 1. Exclude separate projects from bundling (Vite-based projects that use import.meta)
const exclusionList = require('metro-config/src/defaults/exclusionList');
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rootPath = escapeRegex(projectRoot);
config.resolver.blockList = exclusionList([
  // Exclude dev-tools which uses import.meta
  new RegExp(`${rootPath}/src/dev-tools/.*`),
]);

// 2. Add support for additional file extensions
// Put 'cjs' and 'js' before 'mjs' to prefer CJS over ESM for node_modules
// This avoids the import.meta issue in zustand/middleware ESM build
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'cjs', 'json', 'mjs'];

// 2. Add asset extensions for 3D models and media
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'glb',
  'gltf',
  'obj',
  'mtl',
  'ogg',
  'mp3',
  'wav',
];

module.exports = withNativeWind(config, { input: './global.css' });
