/*!
 * Copyright (c) 2017-2022 Digital Bazaar, Inc. All rights reserved.
 */
/* global Image */
export class CredentialHints {
  constructor(url, injector) {
    const remote = injector.get('credentialHints', {
      functions: ['delete', 'get', 'keys', 'has', 'set', 'clear']
    });
    for(let methodName in remote) {
      if(methodName !== 'set') {
        const method = remote[methodName].bind(this, url);
        this[methodName] = function(...args) {
          this._deprecateNotice();
          return method(...args);
        };
      }
    }
    this._remoteSet = remote.set.bind(this, url);
  }

  async set(hintKey, credentialHint) {
    this._deprecateNotice();

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

  _deprecateNotice() {
    console.warn('Credential hints are deprecated and no longer used.');
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
