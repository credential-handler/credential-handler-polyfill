/*!
 * Provides an API for working with CredentialHandlerRegistrations.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import {CredentialHandlerRegistration}
  from './CredentialHandlerRegistration.js';

export class CredentialHandlers {
  constructor(injector) {
    this._injector = injector;
    this._remote = injector.get('credentialHandlers', {
      functions: [
        'register', 'unregister', 'getRegistration', 'hasRegistration']
    });
  }

  /**
   * Creates a credential handler registration.
   *
   * @param url the unique URL for the credential handler.
   *
   * @return a Promise that resolves to the CredentialHandlerRegistration.
   */
  async register(url) {
    // register with credential mediator
    url = await this._remote.register('credential', url);
    return new CredentialHandlerRegistration(url, this._injector);
  }

  /**
   * Unregisters a credential handler, destroying its registration.
   *
   * @param url the unique URL for the credential handler.
   *
   * @return a Promise that resolves to `true` if the handler was registered
   *           and `false` if not.
   */
  async unregister(url) {
    // unregister with credential mediator
    return this._remote.unregister('credential', url);
  }

  /**
   * Gets an existing credential handler registration.
   *
   * @param url the URL for the credential handler.
   *
   * @return a Promise that resolves to the CredentialHandlerRegistration or
   *           `null` if no such registration exists.
   */
  async getRegistration(url) {
    url = await this._remote.getRegistration('credential', url);
    if(!url) {
      return null;
    }
    return new CredentialHandlerRegistration(url, this._injector);
  }

  /**
   * Returns true if the given credential handler has been registered and
   * false if not.
   *
   * @param url the URL for the credential handler.
   *
   * @return a Promise that resolves to `true` if the registration exists and
   *           `false` if not.
   */
  async hasRegistration(url) {
    return await this._remote.hasRegistration('credential', url);
  }
}
