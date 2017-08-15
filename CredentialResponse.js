/*!
 * PaymentResponse polyfill.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

export class PaymentResponse {
  constructor({
    requestId,
    methodName,
    details,
    shippingAddress,
    shippingOption,
    payerName,
    payerEmail,
    payerPhone
  }) {
    this.requestId = requestId;
    this.methodName = methodName;
    this.details = details;
    this.shippingAddress = shippingAddress;
    this.shippingOption = shippingOption;
    this.payerName = payerName;
    this.payerEmail = payerEmail;
    this.payerPhone = payerPhone;
  }

  toJSON() {
    return JSON.stringify({
      requestId: this.requestId,
      methodName: this.methodName,
      details: this.details,
      shippingAddress: this.shippingAddress,
      shippingOption: this.shippingOption,
      payerName: this.payerName,
      payerEmail: this.payerEmail,
      payerPhone: this.payerPhone
    });
  }

  async complete(result = 'unknown') {
    // TODO: implement, return Promise<void>
  }
}
