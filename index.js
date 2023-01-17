/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, window */
import {WebAppContext} from 'web-request-rpc';

import {CredentialHandler} from './CredentialHandler.js';
import {CredentialHandlers} from './CredentialHandlers.js';
import {CredentialManager} from './CredentialManager.js';
import {CredentialsContainer} from './CredentialsContainer.js';
import {PermissionManager} from './PermissionManager.js';
import {WebCredential} from './WebCredential.js';

const DEFAULT_MEDIATOR_ORIGIN = 'https://authn.io';

// export classes for testing/TypeScript
export {
  CredentialHandler,
  CredentialManager,
  WebCredential
};

let loaded;
export async function loadOnce(options) {
  if(loaded) {
    return loaded;
  }

  loaded = true;
  return load(options);
}

export async function load(options = {
  mediatorOrigin: DEFAULT_MEDIATOR_ORIGIN
}) {
  _assertSecureContext();
  // backwards compatibility (`options` used to be a string for expressing
  // the full mediator URL)
  let mediatorUrl;
  if(typeof options === 'string') {
    mediatorUrl = options;
  } else if(options && typeof options === 'object' &&
    typeof options.mediatorOrigin === 'string') {
    mediatorUrl = `${options.mediatorOrigin}/mediator`;
  } else {
    throw new Error(
      '"options.mediatorOrigin" must be a string expressing the ' +
      'origin of the mediator.');
  }

  // temporarily still using this for setting permissions and other
  // non-get/store APIs
  const appContext = new WebAppContext();
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

function _assertSecureContext() {
  if(!window.isSecureContext) {
    throw new DOMException('SecurityError', 'The operation is insecure.')
  }
}
