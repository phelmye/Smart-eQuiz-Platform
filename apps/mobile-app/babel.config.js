module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@smart-equiz/types': '../../packages/types/src',
            '@smart-equiz/utils': '../../packages/utils/src',
          },
        },
      ],
    ],
  };
};
