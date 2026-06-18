/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import config from '@digitalbazaar/eslint-config/browser-recommended';
import globals from 'globals';

export default [
  ...config,
  {
    files: ['webpack.config.js', 'playwright.config.js', 'test/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
