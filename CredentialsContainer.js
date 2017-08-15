/*!
 * Wrapper for native CredentialsContainer that uses remote Credential Mediator
 * for WebCredential-related operations.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, DOMException */
'use strict';

import {WebCredential} from './WebCredential';

export class CredentialsContainer {
  constructor(url, injector) {
    this._nativeCredentialsContainer = navigator.credentials;
    this._remote = injector.get('credentialsContainer', {
      functions: ['get', 'store']
    });
    this._remote.get = this._remote.get.bind(this, url);
    this._remote.store = this._remote.store.bind(this, url);
  }

  async get(/*CredentialRequestOptions*/ options = {}) {
    if(options.web) {
      return this._remote.get(options);
    }
    if(this._nativeCredentialsContainer) {
      return this._nativeCredentialsContainer.get(options);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }

  async store(credential) {
    if(credential instanceof WebCredential) {
      return this._remote.store(credential);
    }
    if(this._nativeCredentialsContainer) {
      return this._nativeCredentialsContainer.store(credential);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }

  async create(/*CredentialCreationOptions*/ options = {}) {
    if(this._nativeCredentialsContainer) {
      return this._nativeCredentialsContainer.create(options);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }

  async preventSilentAccess() {
    if(this._nativeCredentialsContainer) {
      return this._nativeCredentialsContainer.preventSilentAccess();
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }
}
