module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // Transform import.meta.env to process.env for Metro compatibility
      'babel-plugin-transform-import-meta',
      'react-native-reanimated/plugin',
    ],
  };
};
