PUSHmodule.exports = function(api) {
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
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/config': './src/config',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
