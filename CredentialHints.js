/*!
 * API for managing CredentialHints.
 *
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* global Image */
'use strict';

export class CredentialHints {
  constructor(url, injector) {
    const remote = injector.get('credentialHints', {
      functions: ['delete', 'get', 'keys', 'has', 'set', 'clear']
    });
    for(let methodName in remote) {
      if(methodName !== 'set') {
        this[methodName] = remote[methodName].bind(this, url);
      }
    }
    this._remoteSet = remote.set.bind(this, url);
  }

  async set(hintKey, credentialHint) {
    // TODO: validate credential hint

    // ensure images are prefetched so that they will not leak information
    // when fetched later
    credentialHint.icons = credentialHint.icons || [];
    const promises = credentialHint.icons.map(icon =>
      imageToDataUrl(icon.src).then(fetchedImage => {
        icon.fetchedImage = fetchedImage;
      }));
    await Promise.all(promises);
    return this._remoteSet(hintKey, credentialHint);
  }
}

function imageToDataUrl(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      let canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL();
      resolve(dataUrl);
      canvas = null;
    };
    // TODO: `reject` as an error and fail `.set`?
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
