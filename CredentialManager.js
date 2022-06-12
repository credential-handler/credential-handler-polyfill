/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator */
import {CredentialHints} from './CredentialHints.js';

/* A CredentialManager for a Web Credential Mediator. */
export class CredentialManager {
  constructor(url, injector) {
    if(!(url && typeof url === 'string')) {
      throw new TypeError('"url" must be a non-empty string.');
    }
    // FIXME: deprecate `.hints` -- make each method a no-op with a
    // console.warn(); all that is needed is a permission request which will
    // auto-register the credential handler based on what is in `manifest.json`
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
