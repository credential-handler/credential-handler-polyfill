# Credential Handler API polyfill _(credential-handler-polyfill)_

> [Credential Handler API](https://w3c-ccg.github.io/credential-handler-api/) (CHAPI) polyfill for browsers

The CHAPI polyfill provides a number of features that enable the issuance,
holding, presentation, and general management of Verifiable Credentials,
Authorization Capabilities, and a variety of other cross-origin credentials.

For more information on CHAPI and links to updated demos and a playground, check out
[chapi.io](https://chapi.io)!

![Animation showing selection of Credential Handler](https://user-images.githubusercontent.com/108611/121816947-8ec83b80-cc4c-11eb-8592-96b19f7b0b07.gif)

See the [feature videos](#features) for more animations of CHAPI in action.

## Table of Contents

- [Background](#background)
- [Demo](#demo)
- [Usage](#usage)
- [Install](#install)
- [Feature Videos](#features)
- [Security](#security)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

Credential Handler API (CHAPI) is:

* a browser API
* lets web apps securely exchange credentials with digital wallets
* provides a secure _trusted UI_ for users to manage those credentials
* gives users ability to choose service providers for wallets

Read more: [CHAPI Motivation and Background](docs/motivation-and-background.md).

## Demo

Take a look at the following websites to try out a minimal CHAPI implementation:

1. https://wallet.example.chapi.io
2. https://issuer.example.chapi.io
2. https://verifier.example.chapi.io

## Usage

### Loading the Polyfill

Before you can start credential interactions, you need to load the
polyfill library.

If you're [loading the polyfill from a `<script>`
tag](#including-credential-handler-api-in-browser-scripts), you will have
access to the `navigator.credentials` and `credentialHandlerPolyfill` globals.

```js
const polyfill = window.credentialHandlerPolyfill;
try {
  // must be run from an async function if top-level await is unavailable
  await polyfill.loadOnce();
  console.log('Ready to work with credentials!');
} catch(e) {
  console.error('Failed to load CHAPI.', e);
}
```

Otherwise (if you're developing on Node.js and using Webpack, for example),
import it in the usual manner:

```js
import * as polyfill from 'credential-handler-polyfill';
try {
  // must be run from an async function if top-level await is unavailable
  await polyfill.loadOnce();
  console.log('Ready to work with credentials!');
} catch(e) {
  console.error('CHAPI failed to load.', e);
}
```

If you would prefer to not add any global accessors to the API, you can load it
this way:

```js
import * as polyfill from 'credential-handler-polyfill';
try {
  const api = await polyfill.loadOnce({setGlobal: false});
  // do something, like call `api.chapi.interact(...)`
} catch(e) {
  console.error('CHAPI failed to load.', e);
}
```

### Requesting and Storing Credentials with `interact()`

`interact()` is the recommended entry point for relying parties (issuer and
verifier coordinator websites). A coordinator website hands this API a
single **[interaction URL](https://w3c.github.io/vcalm/#interaction-url-format)**
(see the [VCALM specification](https://w3c.github.io/vcalm/)) and the user's
selected credential handler (e.g., digital wallet) drives the rest. The interaction can perform a credential
request, a credential store, or both; the choice is deferred to the exchange
layer behind the interaction URL and is never expressed to or via CHAPI. As
a result, apps using `interact()` no longer need to make the `get()` / `store()`
distinction themselves; a single call covers all combinations.

> **Note:** `interact()` is a new, simplified entry point. See the
> [design spec](docs/specs/interact-api.md). The method name and return shape
> may still change.

The coordinator does not compose a full `web` request object itself. Under the
hood, `interact()` translates the interaction URL into a single
`navigator.credentials.get()` flow, carrying the URL in the `protocols` map
under the well-known `interact` key. Whether the exchange behind that URL ends
up requesting credentials, storing them, or both is opaque to CHAPI.

`interact()` lives on the `chapi` object. The polyfill does **not** attach it to
`navigator`. By default (`setGlobal: true`), `load()`/`loadOnce()` set
`globalThis.chapi` for you, so you can just call `globalThis.chapi.interact(...)`
after loading.

If you'd rather control where the API lives, pass `setGlobal: false` — the
polyfill then attaches nothing to the global environment and only returns the
polyfill, so you place `chapi` yourself:

```js
try {
  globalThis.chapi = (await loadOnce({setGlobal: false})).chapi;
} catch(e) {
  console.log('CHAPI failed to load.', e);
}
```

Then call it:

```js
await chapi.interact({
  // required: an `https:` URL the coordinator already trusts, from its
  // own origin or another origin they expect the end user to trust;
  // CHAPI treats it as opaque (it does not fetch, parse, or encode it). The
  // full "protocols" object is fetched from this URL over TLS by the
  // user-selected credential handler (e.g., a digital wallet), enabling
  // TLS-authentication of its source, even if the URL is delivered via
  // a disconnected system (e.g., via QR code).
  interactionUrl: 'https://coordinator.example/interactions/z1A2b3C4',
  // optional: an AbortSignal to cancel the interaction
  signal,
  // optional: credential handler origins to recommend to the user
  recommendedHandlerOrigins: ['https://wallet.example.chapi.io']
});
```

The returned promise:

- **resolves** to an empty object (`{}`) when the interaction completes; no
  credential data is returned to the coordinator (data minimization),
- **rejects** with a `DOMException` named `AbortError` when the user cancels or
  the caller aborts via `signal`,
- otherwise rejects with the same errors surfaced by
  [`get()`](docs/get-store.md#get) (e.g. `SecurityError` outside a secure
  context).

### Deprecated: `get()` and `store()`

> **⚠️ Deprecated.** Relying parties should use
> [`interact()`](#requesting-and-storing-credentials-with-interact) instead. A
> single [interaction URL](https://w3c.github.io/vcalm/#interaction-url-format)
> covers credential request, storage, or both (the operation is deferred to the
> exchange layer), so the `get()` / `store()` distinction is no longer needed.

These lower-level entry points remain available for now. Instructions for
existing integrations have moved to
[Deprecated: `get()` and `store()`](docs/get-store.md).

### Advanced Operations for Wallet Providers

For most web app developers, your only interaction with the Credential Handler
API will be through
[`interact()`](#requesting-and-storing-credentials-with-interact) (or the
deprecated [`get()` and `store()`](docs/get-store.md) operations).

However, if you're a service provider aiming to offer users a credential
management service or a wallet, you will need the advanced API to prompt the
user for permission to install.

Note that wallet providers do not call `navigator.credentials` at all:
registration uses `CredentialManager.requestPermission()` exported by this
polyfill, and the credential handler itself receives requests via events (or
a `protocols` query parameter) in its handler page — see
[web-credential-handler](https://github.com/credential-handler/web-credential-handler).

#### Serving a manifest.json Web app manifest

In order to register a credential handler, the credential handler website
must serve a "manifest.json" file from its root path ("/manifest.json"). This
file must also be CORS-enabled.

The "manifest.json" file must, at a minimum, contain a "credential_handler"
field that expresses the location of the credential handler and which types
of Web credentials are supported. An example minimal "manifest.json" is:

```js
{
  "credential_handler": {
    "url": "/wallet-worker.html",
    "enabledTypes": ["VerifiablePresentation"]
  }
}
```

A better "manifest.json" that would include display hints is:

```js
{
  "icons": [
    {
      "sizes": "48x48 64x64",
      "src": "demo-wallet.png",
      "type": "image/png"
    }
  ],
  "name": "Demo Wallet",
  "short_name": "Demo Wallet",
  "credential_handler": {
    "url": "/wallet-worker.html",
    "enabledTypes": ["VerifiablePresentation"]
  }
}
```

If a Web app manifest with a proper "credential_handler" field cannot be
retrieved from `/manifest.json`, then any permission request to allow the
site to manage credentials for a user will be denied.

An example wallet worker page (the `url` for the credential handler)
can be found here:

https://github.com/credential-handler/chapi-demo-wallet/blob/master/wallet-worker.html

#### Requesting Permission to Register the Handler

```js
const {CredentialManager, CredentialHandlers} = polyfill;

// if permission is granted, the handler URL in `credential_handler` in
// `/manifest.json` will be installed and made available as a choice whenever
// the `enabledTypes` in `credential_handler` in `/manifest.json` match a
// credential `get` or `store` request
const result = await CredentialManager.requestPermission();
if(result !== 'granted') {
  throw new Error('Permission denied.');
}
```

## Install

### Including Credential Handler API in browser scripts

Adding the following `<script>` makes the `navigator.credentials`  and
`credentialHandlerPolyfill` globals available to your code.

```html
<script src="https://unpkg.com/credential-handler-polyfill@4/dist/credential-handler-polyfill.min.js"></script>
```

### Installing using Node.js (for development)

To install as a dependency of another project, add this to your `package.json`:

```
"credential-handler-polyfill": "^4.1.0"
```

If you plan to develop or modify this polyfill, install it from Github:

```
git clone https://github.com/credential-handler/credential-handler-polyfill.git
cd credential-handler-polyfill
npm install
```

### Testing

The polyfill has a cross-browser smoke test suite (Playwright) that loads the
built bundle in Chromium, Firefox, and WebKit and verifies that `loadOnce()`
resolves and patches `navigator.credentials`. It includes a regression guard
for the case where `navigator.credentials` is non-configurable (as on
Safari/iOS).

Install the browser binaries once, then run the tests:

```
npx playwright install --with-deps chromium firefox webkit
npm test
```

## Features

The CHAPI polyfill provides a number of features that enable the issuance,
holding, presentation, and general management of Verifiable Credentials,
Authorization Capabilities, and a variety of other cross-origin credentials.

### Add Credential Handler

You can add a Credential Handler by calling the
`CredentialManager.requestPermission()` API. This call will ensure that the
individual using the browser explicitly confirms that they want to use the
website as a credential handler. ***This call must be called immediately
following a user interaction, such as a button click or tap in order to
ensure that the permission prompt can be shown to the user.***

![Animation showing addition of a Credential Handler](https://user-images.githubusercontent.com/108611/121816921-6b9d8c00-cc4c-11eb-940f-66881582b7ca.gif)

### Store Credentials

CHAPI supports storing credentials via the `navigator.credentials.store()` API.
Storage of credentials prompts the individual using the browser to confirm
that they want to store the credential in their digital wallet.

![Animation showing storage of Credentials](https://user-images.githubusercontent.com/108611/121817547-0e0b3e80-cc50-11eb-9c6e-99647ae7f61d.gif)

### Present Credentials

CHAPI supports the presentation of credentials via the
`navigator.credentials.get()` API. CHAPI is agnostic to the presentation
request query language and passes the query directly through to the credential
handler. When presenting credentials, the individual is shown what they will
be sharing and must provide explicit consent before the credentials are
shared with the requesting party.

![Animation showing request for a Credential](https://user-images.githubusercontent.com/108611/121817634-925dc180-cc50-11eb-9f80-c01b4ac97233.gif)

### Select Credential Handler

Multiple credential handlers may be registered. If an individual has multiple
credential handlers registered, they are given the option of selecting between
the handlers or setting one as the default on a per-website basis.

![Animation showing selection of Credential Handler](https://user-images.githubusercontent.com/108611/121816947-8ec83b80-cc4c-11eb-8592-96b19f7b0b07.gif)

### Hide Credential Handler

When an individual desires to not use a credential handler anymore, they can
hide that credential handler via the interface. If they accidentally click
the hide button, they have several seconds to undo the action. Credential
Handlers that are hidden can be added again by going to the registration
website.

![Animation showing hiding of Credential Handler](https://user-images.githubusercontent.com/108611/121817058-1615af00-cc4d-11eb-959e-139a32137fd4.gif)

### Just-In-Time Install of Credential Handler

If an individual has no credential handlers registered, the website that
uses CHAPI can suggest up to three credential handlers that can be
"just in time" installed so that the original storage operation can
complete.

![Animation showing Just-In-Time Addition of Credential Handler](https://user-images.githubusercontent.com/108611/121817000-d3ec6d80-cc4c-11eb-89ad-397b2bf85773.gif)

### Works on Mobile

CHAPI is designed to run on desktop, tablet, and mobile form factors. The
interface is responsive to provide the best experience for each form factor.

![Animation showing Credential Handler working on Mobile](https://user-images.githubusercontent.com/108611/121817969-6b07f400-cc52-11eb-8fc0-bb27aab88e91.gif)

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
