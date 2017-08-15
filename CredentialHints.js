/*!
 * API for managing CredentialHints.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

export class CredentialHints {
  constructor(url, injector) {
    const remote = injector.get('credentialHints', {
      functions: ['delete', 'get', 'keys', 'has', 'set', 'clear']
    });
    for(let methodName in remote) {
      this[methodName] = remote[methodName].bind(this, url);
    }
  }
}
