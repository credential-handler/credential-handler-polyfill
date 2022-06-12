/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
// RPC timeouts, 0 = indefinite
const PERMISSION_REQUEST_TIMEOUT = 0;

/* Provides an API for working with permissions. */
export class PermissionManager {
  constructor(injector) {
    this._init = (async () => {
      this._remote = (await injector).get('permissionManager', {
        functions: [
          'query',
          {name: 'request', options: {timeout: PERMISSION_REQUEST_TIMEOUT}},
          'revoke']
      });
    })();
  }

  async query(permissionDesc) {
    await this._init;
    return await this._remote.query(permissionDesc);
  }

  async request(permissionDesc) {
    await this._init;
    return await this._remote.request(permissionDesc);
  }

  async revoke(permissionDesc) {
    await this._init;
    return await this._remote.revoke(permissionDesc);
  }
}
