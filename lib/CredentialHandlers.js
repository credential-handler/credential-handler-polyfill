/*!
 * Copyright (c) 2017-2024 Digital Bazaar, Inc. All rights reserved.
 */
import {CredentialHandlerRegistration}
  from './CredentialHandlerRegistration.js';

export class CredentialHandlers {
  constructor(injector) {
    this._init = (async () => {
      this._injector = await injector;
      this._remote = this._injector.get('credentialHandlers', {
        functions: [
          'register', 'unregister', 'getRegistration', 'hasRegistration']
      });
    })();
  }

  /**
   * Creates a credential handler registration.
   *
   * @param {string} url - The unique URL for the credential handler.
   *
   * @returns {Promise} Resolves to the CredentialHandlerRegistration.
   */
  async register(url) {
    this._deprecateNotice();
    await this._init;
    // register with credential mediator
    url = await this._remote.register('credential', url);
    return new CredentialHandlerRegistration(url, this._injector);
  }

  /**
   * Unregisters a credential handler, destroying its registration.
   *
   * @param {string} url - The unique URL for the credential handler.
   *
   * @returns {Promise} Resolves to `true` if the handler was registered and
   *   `false` if not.
   */
  async unregister(url) {
    this._deprecateNotice();
    await this._init;
    // unregister with credential mediator
    return this._remote.unregister('credential', url);
  }

  /**
   * Gets an existing credential handler registration.
   *
   * @param {string} url - The URL for the credential handler.
   *
   * @returns {Promise} Resolves to the CredentialHandlerRegistration or `null`
   *   if no such registration exists.
   */
  async getRegistration(url) {
    this._deprecateNotice();
    await this._init;
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
   * @param {string} url - The URL for the credential handler.
   *
   * @returns {Promise} Resolves to `true` if the registration exists and
   *   `false` if not.
   */
  async hasRegistration(url) {
    this._deprecateNotice();
    await this._init;
    /* eslint-disable-next-line no-return-await */
    return await this._remote.hasRegistration('credential', url);
  }

  _deprecateNotice() {
    console.warn(
      'Credential handler registration APIs are deprecated. The credential ' +
      'handler specified in "manifest.json" is now automatically registered ' +
      'when a user grants permission to install a credential handler via ' +
      '"CredentialManager.requestPermission()".');
  }
}
