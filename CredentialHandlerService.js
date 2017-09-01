/*!
 * A CredentialHandlerService handles remote calls to a CredentialHandler.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {CredentialRequestEvent} from './CredentialRequestEvent.js';
import {CredentialStoreEvent} from './CredentialStoreEvent.js';

export class CredentialHandlerService {
  constructor(credentialHandler) {
    this._credentialHandler = credentialHandler;
  }

  async request(credentialRequestEvent) {
    // TODO: validate credentialRequestEvent
    return await this._credentialHandler._emitter.emit(
      new CredentialRequestEvent(Object.assign(
        {credentialHandler: this._credentialHandler}, credentialRequestEvent)));
  }

  async store(credentialStoreEvent) {
    // TODO: validate credentialStoreEvent
    return await this._credentialHandler._emitter.emit(
      new CredentialStoreEvent(Object.assign(
        {credentialHandler: this._credentialHandler}, credentialStoreEvent)));
  }
}
