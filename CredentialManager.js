/*!
 * A CredentialManager for a Web Credential Mediator.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator */
'use strict';

import {utils} from 'web-request-rpc';

import {CredentialHints} from './CredentialHints.js';

export class CredentialManager {
  constructor(url, injector) {
    if(!(url && typeof url === 'string')) {
      throw new TypeError('"url" must be a non-empty string.');
    }
    this.hints = new CredentialHints(url, injector);
  }

  /**
   * Requests that the user grant 'credentialhandler' permission to the current
   * origin.
   *
   * @return a Promise that resolves to the new PermissionState of the
   *           permission (e.g. 'granted'/'denied').
   */
  static async requestPermission() {
    const status = await navigator.credentialsPolyfill.permissions.request(
      {name: 'credentialhandler'});
    return status.state;
  }
}
