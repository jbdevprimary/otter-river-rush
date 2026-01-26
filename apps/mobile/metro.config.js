const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
// This is the monorepo root
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Add support for additional file extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// 5. Handle workspace packages
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Resolve workspace packages to their source
  if (moduleName.startsWith('@otter-river-rush/')) {
    const packageName = moduleName.replace('@otter-river-rush/', '');
    const packagePath = path.resolve(monorepoRoot, 'packages', packageName);

    // Try to resolve from the package's src directory
    try {
      return context.resolveRequest(context, packagePath, platform);
    } catch {
      // Fall through to default resolution
    }
  }

  // Default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
