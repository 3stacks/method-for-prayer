// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // data/ is written by scripts/build-data.mjs and scripts/build-kjv.mjs.
    // site/ has its own ESLint config (npm --prefix site run lint).
    ignores: ['dist/*', 'data/*', 'source/*', 'site/*'],
  },
]);
