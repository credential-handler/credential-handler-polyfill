/*!
 * Copyright (c) 2026 Digital Bazaar, Inc. All rights reserved.
 */
import config from '@digitalbazaar/eslint-config/browser-recommended';
import globals from 'globals';

export default [
  ...config,
  {
    files: ['webpack.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
