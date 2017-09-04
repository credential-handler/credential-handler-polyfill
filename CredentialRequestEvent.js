/*!
 * A CredentialRequestEvent is emitted when a request has been made for
 * credentials.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global Event */
'use strict';

import * as rpc from 'web-request-rpc';

// can't use "ExtendableEvent"; only accessible from Workers
// TODO: may not be able to even extend `Event` here; could produce "incorrect"
//   core attributes
export class CredentialRequestEvent /*extends Event*/ {
  constructor({
    credentialHandler,
    credentialRequestOrigin,
    credentialRequestOptions,
    hintKey
  }) {
    //super('credentialrequest');
    this.type = 'credentialrequest';
    this._credentialHandler = credentialHandler;
    this.credentialRequestOrigin = credentialRequestOrigin;
    this.credentialRequestOptions = credentialRequestOptions;
    this.hintKey = hintKey;
  }

  async openWindow(url) {
    // TODO: disallow more than one call

    // TODO: ensure `url` is to the same origin
    await this._credentialHandler.show();
    const appWindow = new rpc.WebAppWindow(url, {
      className: 'credential-handler'
    });
    appWindow.ready();
    appWindow.show();
    // TODO: note that `appWindow.handle` is not a ServiceWorker
    //   `WindowClient` polyfill... could be confusing here, should we
    //   implement one to wrap it? -- there is, for example, a
    //   `navigate` call on `WindowClient` that enforces same origin, would
    //   need to attempt to add or approximate that
    return appWindow.handle;
  }

  respondWith(handlerResponse) {
    // TODO: throw exception if `_promise` is already set

    // TODO: validate handlerResponse
    this._promise = handlerResponse;
  }
}
