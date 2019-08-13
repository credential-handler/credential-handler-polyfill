# Credential Handler API polyfill _(credential-handler-polyfill)_

> [Credential Handler API](https://w3c-ccg.github.io/credential-handler-api/) (CHAPI) polyfill for browsers

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Security](#security)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

## Install

#### Including `credential-handler-api` in browser scripts

Adding the following `<script>` makes the `navigator.credentials` object
available to your code.

```html
<script src="https://unpkg.com/credential-handler-polyfill@1.0.4/dist/credential-handler-polyfill.min.js"></script>
```

#### Installing using Node.js (for development)

To install as a dependency of another project, add this to your `package.json`:

```
"credential-handler-polyfill": "^1.0.0"
```

If you plan to develop or modify this polyfill, install it from Github:

```
git clone https://github.com/digitalbazaar/credential-handler-polyfill.git
cd credential-handler-polyfill
npm install
```

## Usage

### Loading the Polyfill

```js
const polyfill = require('credential-handler-polyfill');
// or
import * as polyfill from 'credential-handler-polyfill';

const MEDIATOR_ORIGIN = 'https://beta.authn.io';

const mediatorUrl = MEDIATOR_ORIGIN + '/mediator?origin=' +
  encodeURIComponent(window.location.origin);

const loadPolyfillPromise = polyfill.loadOnce(mediatorUrl);
```

### Installing a Credential Handler

### Receiving a Web Credential

A web app (for example, a credential **issuer** such as a university or 
institution) can ask to _store_ a credential, for example when the user pushes 
a button to receive a credential.

```js
const result = await navigator.credentials.store({web: {}});
if(!result) {
  console.log('credential storage canceled');
}
```

### Requesting a Web Credential

A web app (a Relying Party or **verifier**) can request a credential from the 
credential handler, for example when the user 
pushes a button on a page that requires identity attributes or authentication.

```js
const webCredential = await navigator.credentials.get({web: {}});

if(!webCredential) {
  console.log('credential request canceled/denied'); // no response from user
}
```

## Security

This polyfill makes use of a UI that emulates secure browser UI (also known as 
"browser chrome"). This polyfill UI is an emulation and IS NOT implemented by 
the browser. Support for the 
[Credential Handler API](https://w3c-ccg.github.io/credential-handler-api/) 
could make this UI (or most likely a much better one!) a reality in browsers in 
the future.

## Contribute

See [the contribute file](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md)!

PRs accepted.

Note: If editing the README, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Commercial Support

Commercial support for this library is available upon request from
Digital Bazaar: support@digitalbazaar.com

## License

[New BSD License (3-clause)](LICENSE) © Digital Bazaar
