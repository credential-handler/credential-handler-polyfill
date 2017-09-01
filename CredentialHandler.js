/*!
 * The core CredentialHandler class.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global DOMException */
'use strict';

import * as rpc from 'web-request-rpc';

import {CredentialHandlerService} from './CredentialHandlerService.js';

const EVENT_TYPES = ['credentialrequest', 'credentialstore'];

export class CredentialHandler extends rpc.WebApp {
  constructor(mediatorOrigin) {
    if(typeof mediatorOrigin !== 'string') {
      throw new TypeError('"mediatorOrigin" must be a string.');
    }
    super(mediatorOrigin);
    this._emitter = new rpc.EventEmitter({
      async waitUntil(event) {
        // TODO: may need to do `this.hide()` after this promise resolves
        //   to handle case where e.openWindow() was called
        return event._promise || Promise.reject(
          new DOMException(
            'No "credentialrequest" event handler found.', 'NotFoundError'));
      }
    });
  }

  async connect() {
    const injector = await super.connect();

    // define API that CredentialMediator can call on this credential handler
    this.server.define('credentialHandler', new CredentialHandlerService(this));

    // auto-call `ready`
    await this.ready();

    return injector;
  }

  addEventListener(eventType, fn) {
    if(!EVENT_TYPES.includes(eventType)) {
      throw new DOMException(
        `Unsupported event type "${eventType}"`, 'NotSupportedError');
    }
    return this._emitter.addEventListener(eventType, fn);
  }

  removeEventListener(eventType, fn) {
    if(!EVENT_TYPES.includes(eventType)) {
      throw new DOMException(
        `Unsupported event type "${eventType}"`, 'NotSupportedError');
    }
    return this._emitter.removeEventListener(eventType, fn);
  }
}
