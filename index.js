/*!
 * Credential Handler API Polyfill.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

import * as rpc from 'web-request-rpc';

import {PaymentHandler} from './PaymentHandler';
import {PaymentHandlers} from './PaymentHandlers';
import {PaymentManager} from './PaymentManager';
import {PaymentRequest} from './PaymentRequest';

// RPC timeouts, 0 = indefinite
const PAYMENT_ABORT_TIMEOUT = 40 * 1000;
const PAYMENT_REQUEST_TIMEOUT = 0;
const PERMISSION_REQUEST_TIMEOUT = 0;

let loaded;
export async function loadOnce(mediatorUrl) {
  if(loaded) {
    return loaded;
  }
  return loaded = await load(mediatorUrl);
}

export async function load(mediatorUrl) {
  console.log('loading payment handler polyfill...');
  const polyfill = {};

  if(!mediatorUrl) {
    mediatorUrl = 'https://payment.mediator.dev:12443/mediator?origin=' +
      encodeURIComponent(window.location.origin)
  }

  //const url = 'https://bedrock.dev:18443/mediator';
  const appContext = new rpc.WebAppContext();
  const injector = await appContext.createWindow(mediatorUrl);

  // TODO: only install PaymentRequestService when appropriate
  polyfill._paymentRequestService = injector.get('paymentRequest', {
    functions: [
      {name: 'show', options: {timeout: PAYMENT_REQUEST_TIMEOUT}},
      {name: 'abort', options: {timeout: PAYMENT_ABORT_TIMEOUT}}]
  });
  polyfill.permissions = injector.get('permissionManager', {
    functions: [
      'query',
      {name: 'request', options: {timeout: PERMISSION_REQUEST_TIMEOUT}},
      'revoke']
  });

  // TODO: only install PaymentHandlers API when appropriate
  polyfill.PaymentHandlers = new PaymentHandlers(injector);

  // TODO: only expose PaymentHandler API when appropriate
  polyfill.PaymentHandler = PaymentHandler;

  // TODO: only expose PaymentManager API when appropriate
  polyfill.PaymentManager = PaymentManager;

  // TODO: only expose PaymentRequest API when appropriate
  polyfill.PaymentRequest = PaymentRequest;

  // expose polyfill
  navigator.paymentPolyfill = polyfill;

  // TODO: name for `XCredential`?
  //   VerifiableClaimCredential?
  //   AttributeCredential?
  //   ProfileCredential?

  console.log('payment handler polyfill loaded');

  return polyfill;
};
