/*!
 * Wrapper for native CredentialsContainer that uses remote Credential Mediator
 * for WebCredential-related operations.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, DOMException */
'use strict';

import {WebCredential} from './WebCredential.js';

// RPC timeouts, 0 = indefinite
const CREDENTIAL_GET_TIMEOUT = 0;
const CREDENTIAL_STORE_TIMEOUT = 0;

export class CredentialsContainer {
  constructor(injector) {
    this._nativeCredentialsContainer = navigator.credentials;
    this._remote = injector.get('credentialsContainer', {
      functions: [
        {name: 'get', options: {timeout: CREDENTIAL_GET_TIMEOUT}},
        {name: 'store', options: {timeout: CREDENTIAL_STORE_TIMEOUT}}
      ]
    });
  }

  async get(/*CredentialRequestOptions*/ options = {}) {
    if(options.web) {
      const credential = await this._remote.get(options);
      if(!credential) {
        // no credential selected
        return null;
      }
      // TODO: validate credential
      return new WebCredential(credential.dataType, credential.data);
    }
    if(this._nativeCredentialsContainer) {
      return this._nativeCredentialsContainer.get(options);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }

  async store(credential) {
    if(credential instanceof WebCredential) {
      const result = await this._remote.store(credential);
      if(!result) {
        // nothing stored
        return null;
      }
      // TODO: validate result
      return new WebCredential(result.dataType, result.data);
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
