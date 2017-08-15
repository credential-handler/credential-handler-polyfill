/*!
 * A WebCredential is a Credential that can be retrieved from or stored by a
 * "credential handler" that runs in a third party Web application.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

export class WebCredential {
  constructor(dataType, data) {
    if(typeof dataType !== 'string') {
      throw new TypeError('"dataType" must be a string.');
    }
    this.type = 'web';
    this.dataType = dataType;
    this.data = data;
  }
}
