/*!
 * A CredentialHandlerRegistration provides a CredentialManager to enable Web
 * apps to register Profiles that can be presented to websites.
 *
 * Copyright (c) 2017-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {CredentialManager} from './CredentialManager.js';

export class CredentialHandlerRegistration {
  constructor(url, injector) {
    if(!(url && typeof url === 'string')) {
      throw new TypeError('"url" must be a non-empty string.');
    }
    this.credentialManager = new CredentialManager(url, injector);
  }
}
