/*!
 * Credential Handler API Polyfill.
 *
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, window */
'use strict';

import * as rpc from 'web-request-rpc';

import {CredentialHandler} from './CredentialHandler.js';
import {CredentialHandlers} from './CredentialHandlers.js';
import {CredentialManager} from './CredentialManager.js';
import {CredentialsContainer} from './CredentialsContainer.js';
import {PermissionManager} from './PermissionManager.js';
import {WebCredential} from './WebCredential.js';

const DEFAULT_MEDIATOR = 'https://authn.io/mediator' + '?origin=' +
  encodeURIComponent(window.location.origin);

let loaded;
export async function loadOnce(mediatorUrl = DEFAULT_MEDIATOR) {
  if(loaded) {
    return loaded;
  }

  loaded = true;
  return load(mediatorUrl);
}

export async function load(mediatorUrl = DEFAULT_MEDIATOR) {
  const appContext = new rpc.WebAppContext();
  const injector = appContext.createWindow(mediatorUrl, {
    className: 'credential-mediator',
    // 30 second timeout for loading the mediator
    timeout: 30000
  });
  // ensure backdrop is transparent by default
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(
    `dialog.web-app-window.credential-mediator > .web-app-window-backdrop {
      background-color: rgba(0, 0, 0, 0.25);
    }`));
  document.body.appendChild(style);

  const polyfill = {};

  // TODO: only expose certain APIs when appropriate
  polyfill.permissions = new PermissionManager(injector);
  polyfill.CredentialHandlers = new CredentialHandlers(injector);
  polyfill.CredentialHandler = CredentialHandler;
  polyfill.CredentialManager = CredentialManager;
  polyfill.credentials = new CredentialsContainer(injector);
  polyfill.WebCredential = WebCredential;

  // expose polyfill
  navigator.credentialsPolyfill = polyfill;

  // polyfill
  if('credentials' in navigator) {
    navigator.credentials.get = polyfill.credentials.get.bind(
      polyfill.credentials);
    navigator.credentials.store = polyfill.credentials.store.bind(
      polyfill.credentials);
  } else {
    navigator.credentials = polyfill.credentials;
  }
  window.CredentialManager = CredentialManager;
  window.WebCredential = WebCredential;

  return polyfill;
}
