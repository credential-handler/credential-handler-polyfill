/*!
 * Wrapper for native CredentialsContainer that uses remote Credential Mediator
 * for WebCredential-related operations.
 *
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, DOMException */
'use strict';

import {WebCredential} from './WebCredential.js';

// RPC timeouts, 0 = indefinite
const CREDENTIAL_GET_TIMEOUT = 0;
const CREDENTIAL_STORE_TIMEOUT = 0;

export class CredentialsContainer {
  constructor(injector) {
    this._nativeCredentialsContainer = {
      get: navigator.credentials && navigator.credentials.get &&
        navigator.credentials.get.bind(navigator.credentials),
      store: navigator.credentials && navigator.credentials.store &&
        navigator.credentials.store.bind(navigator.credentials),
    };

    this._init = (async () => {
      this._remote = (await injector).get('credentialsContainer', {
        functions: [
          {name: 'get', options: {timeout: CREDENTIAL_GET_TIMEOUT}},
          {name: 'store', options: {timeout: CREDENTIAL_STORE_TIMEOUT}}
        ]
      });
    })();
  }

  async get(/*CredentialRequestOptions*/ options = {}) {
    if(options.web) {
      await this._init;
      const credential = await this._remote.get(options);
      if(!credential) {
        // no credential selected
        return null;
      }
      // TODO: validate credential
      return new WebCredential(credential.dataType, credential.data);
    }
    if(this._nativeCredentialsContainer.get) {
      return this._nativeCredentialsContainer.get(options);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }

  async store(credential) {
    if(credential instanceof WebCredential) {
      await this._init;
      const result = await this._remote.store(credential);
      if(!result) {
        // nothing stored
        return null;
      }
      // TODO: validate result
      return new WebCredential(result.dataType, result.data);
    }
    if(this._nativeCredentialsContainer.store) {
      return this._nativeCredentialsContainer.store(credential);
    }
    throw new DOMException('Not implemented.', 'NotSupportedError');
  }
}
