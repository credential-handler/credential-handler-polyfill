/*!
 * Copyright (c) 2019 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, window, document */
'use strict';

const workerUrl = '/demo/worker.html'

async function installHandler() {
  console.log('Loading polyfill...');

  try {
    await credentialHandlerPolyfill.loadOnce();
  } catch(e) {
    console.error('Error in loadOnce:', e);
  }

  console.log('Polyfill loaded.');
  document.getElementById('loadingText').innerHTML = 'Polyfill loaded.';

  const registration = await WebCredentialHandler
    .installHandler({url: workerUrl})

  await registration.credentialManager.hints.set(
    'test', {
      name: 'TestUser',
      enabledTypes: ['VerifiablePresentation', 'VerifiableCredential']
    });
}

function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
