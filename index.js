/*!
 * Credential Handler API Polyfill.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as rpc from 'web-request-rpc';

import {CredentialHandler} from './CredentialHandler';
import {CredentialHandlers} from './CredentialHandlers';
import {CredentialManager} from './CredentialManager';
import {CredentialsContainer} from './CredentialsContainer';
import {WebCredential} from './WebCredential';

// RPC timeouts, 0 = indefinite
const PERMISSION_REQUEST_TIMEOUT = 0;

let loaded;
export async function loadOnce(mediatorUrl) {
  if(loaded) {
    return loaded;
  }
  return loaded = await load(mediatorUrl);
}

export async function load(mediatorUrl) {
  console.log('loading credential handler polyfill...');
  const polyfill = {};

  if(!mediatorUrl) {
    mediatorUrl = 'https://credential.mediator.dev:15443/mediator?origin=' +
      encodeURIComponent(window.location.origin)
  }

  //const url = 'https://bedrock.dev:18443/mediator';
  const appContext = new rpc.WebAppContext();
  const injector = await appContext.createWindow(mediatorUrl);

  polyfill.permissions = injector.get('permissionManager', {
    functions: [
      'query',
      {name: 'request', options: {timeout: PERMISSION_REQUEST_TIMEOUT}},
      'revoke']
  });

  // TODO: only install CredentialHandlers API when appropriate
  polyfill.CredentialHandlers = new CredentialHandlers(injector);

  // TODO: only expose CredentialHandler API when appropriate
  polyfill.CredentialHandler = CredentialHandler;

  // TODO: only expose CredentialManager API when appropriate
  polyfill.CredentialManager = CredentialManager;

  // TODO: only expose CredentialsContainer API when appropriate
  polyfill.credentials = new CredentialsContainer(injector);

  // TODO: only expose WebCredential API when appropriate
  polyfill.WebCredential = WebCredential;

  // expose polyfill
  navigator.credentialsPolyfill = polyfill;

  console.log('credential handler polyfill loaded');

  return polyfill;
};
