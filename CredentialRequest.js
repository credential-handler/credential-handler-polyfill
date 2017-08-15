/*!
 * PaymentRequest polyfill.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator */
'use strict';

import {utils} from 'web-request-rpc';

import {PaymentResponse} from './PaymentResponse';

/* Example usage:
  const pr = new PaymentRequest([{
    supportedMethods: ['basic-card']
  }], {
    total: {
      label: 'Total',
      amount: {currency: 'USD', value: '1.00'}
    }
  });
  try {
    const response = await pr.show();
  } catch(e) {
    console.error(e);
  }
*/

export class PaymentRequest {
  constructor(methodData, details, options) {
    // TODO: validate methodData
    // TODO: validate details
    // TODO: validate options

    // generate `details.id` if not set
    this.id = 'id' in details ? details.id : utils.uuidv4();
    this.methodData = methodData.slice();
    this.details = Object.assign({id: this.id}, details);
    this.options = Object.assign({}, options);

    this.shippingAddress = null;
    this.shippingOption = null;
    this.shippingType = null;

    this._remote = navigator.paymentPolyfill._paymentRequestService;

    // TODO: reuse `EventHandler` from either `web-request-rpc` or
    //   `web-request-mediator-client` (location TBD) to implement these
    // TODO: should be setters that use `EventEmitter.removeEventListener`
    //   and `EventEmitter.addEventListener` ... also pull in
    //   `EventEmitter` from the same lib

    // attribute EventHandler onshippingaddresschange;
    // attribute EventHandler onshippingoptionchange;
  }

  async show() {
    // TODO: handle state (already shown? etc)
    if(!this.id) {
      throw new Error('InvalidStateError');
    }

    // show request and await response
    return new PaymentResponse(await this._remote.show({
      methodData: this.methodData,
      details: this.details,
      options: this.options
    }));
  }

  async abort() {
    // TODO: handle state (not yet shown? etc)
    if(!this.id) {
      throw new Error('InvalidStateError');
    }
    return this._remote.abort();
  }

  async canMakePayment() {
    return this._remote.canMakePayment({
      methodData: this.methodData,
      details: this.details,
      options: this.options
    });
  }
}
