# Credential Handler API polyfill _(credential-handler-polyfill)_

> [Credential Handler API](https://w3c-ccg.github.io/credential-handler-api/) (CHAPI) polyfill for browsers

The CHAPI polyfill provides a number of features that enable the issuance,
holding, presentation, and general management of Verifiable Credentials,
Authorization Capabilities, and a variety of other cross-origin credentials.

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
* lets web apps securely `get()` and `store()` credentials, without
  having to roll their own wallet infrastructure
* provides a secure _trusted UI_ for users to manage those credentials
* gives users ability to choose service providers for wallets

Read more: [CHAPI Motivation and Background](docs/motivation-and-background.md).

## Demo

Take a look at the following websites to try out a minimal CHAPI implementation:

1. https://chapi-demo-wallet.digitalbazaar.com/
2. https://chapi-demo-issuer.digitalbazaar.com/
2. https://chapi-demo-verifier.digitalbazaar.com/

## Usage

### Loading the Polyfill

Before you can get and store credentials, you need to load the
polyfill library.

If you're [loading the polyfill from a `<script>`
tag](#including-credential-handler-api-in-browser-scripts), you will have
access to the `navigator.credentials` and `credentialHandlerPolyfill` globals.

```js
const polyfill = window.credentialHandlerPolyfill;
```

Otherwise (if you're developing on Node.js and using Webpack, for example),
import it in the usual manner:

```js
import * as polyfill from 'credential-handler-polyfill';
````

Load (async):

```js
await polyfill.loadOnce();
console.log('Ready to work with credentials!');
```

### Requesting and Storing Credentials

A web application can `get()` and `store()` credentials without knowing anything
about the user's wallet. This is intentional; for privacy reasons, the client
app must not be able to query any information (without user consent) about which wallets or
credential handlers a user may have installed (otherwise, fingerprinting and
other attacks would be possible).

#### `get()`

A web app (a Relying Party or **verifier**) can request a credential using
`credentials.get()` during a user gesture event, for example when the user
pushes a button on a page that requires identity attributes or authentication.

```js
const credentialQuery = {web: {}}; // TODO: Update to something more useful
const webCredential = await navigator.credentials.get(credentialQuery);

if(!webCredential) {
  console.log('no credentials received');
}
```

#### `store()`

A web app (for example, a credential **issuer** such as a university or
institution) can ask to _store_ a credential during a user gesture event, for example when the user pushes
a button to receive a credential.

TODO: Expand on [`WebCredential` object](#webcredential)

```js
const result = await navigator.credentials.store(webCredential);
if(!result) {
  console.log('store credential operation did not succeed');
}
```

#### WebCredential

TODO: Discuss creating and receiving WebCredential instances

When working with VerifiableCredentials (just one type of credential
supported by CHAPI), a VerifiablePresentation is used to both store or
present VerifiableCredentials. When storing a VerifiableCredential, the
VerifiablePresentation does not need to be signed.

```js
const presentation = {
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "type": "VerifiablePresentation",
  "verifiableCredential": [{
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://www.w3.org/2018/credentials/examples/v1"
    ],
    "id": "http://example.edu/credentials/1872",
    "type": ["VerifiableCredential", "AlumniCredential"],
    "issuer": "https://example.edu/issuers/565049",
    "issuanceDate": "2010-01-01T19:73:24Z",
    "credentialSubject": {
      "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
      "alumniOf": {
        "id": "did:example:c276e12ec21ebfeb1f712ebc6f1",
        "name": {
          "value": "Example University",
          "lang": "en"
        }
      }
    },
    "proof": {
      "type": "RsaSignature2018",
      "created": "2017-06-18T21:19:10Z",
      "proofPurpose": "assertionMethod",
      "verificationMethod": "https://example.edu/issuers/keys/1",
      "jws": "eyJhbGciOiJSUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..TCYt5XsITJX1CxPCT8yAV-TVkIEq_PbChOMqsLfRoPsnsgw5WEuts01mq-pQy7UJiN5mgRxD-WUcX16dUEMGlv50aqzpqh4Qktb3rk-BuQy72IFLOqV0G_zS245-kronKb78cPN25DGlcTwLtjPAYuNzVBAh4vGHSrQyHUdBBPM"
    }
  }]
};

const webCredential = new WebCredential('VerifiablePresentation', presentation);
```

#### Handling Empty Results

If the `get()` or `store()` operation resolves to a `null` value, this means one
of two things:

1. The user has denied or canceled the request
2. The user does not have a wallet (credential handler service) installed

As mentioned previously, there is (intentionally) _no way for the client to know
which_ of these is the case.

As an app developer, the recommended way to handle this situation depends on
your specific use case. This dilemma is familiar to mobile app developers asking
for specific phone permissions (to access the camera or location, for example).
It is up to you to decide whether your app has fallback mechanisms, or whether
the operation is required and things come to a halt without it.

Typical ways of handling empty results may include:

* Invite the user to install a wallet if they haven't already (and provide a
  link/recommendation)
* (In case the user denied the request) Invite the user to retry the operation,
  after explaining why you're asking to get or store the credential
* (If possible/applicable) Provide an alternate path to the user (the conceptual
  equivalent of allowing "Guest Checkout" if the user has refused to register
  for an ecommerce account).

### Advanced Operations for Wallet Providers

For most web app developers, your only interaction with the Credential Handler
API will be through the `get` and `store` operations.

However, if you're a service provider aiming to offer users a credential
management service or a wallet, you will need the advanced API to prompt the
user for permission to install.

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
<script src="https://unpkg.com/credential-handler-polyfill@2.1.0/dist/credential-handler-polyfill.min.js"></script>
```

### Installing using Node.js (for development)

To install as a dependency of another project, add this to your `package.json`:

```
"credential-handler-polyfill": "^2.1.0"
```

If you plan to develop or modify this polyfill, install it from Github:

```
git clone https://github.com/digitalbazaar/credential-handler-polyfill.git
cd credential-handler-polyfill
npm install
```

## Features

The CHAPI polyfill provides a number of features that enable the issuance,
holding, presentation, and general management of Verifiable Credentials,
Authorization Capabilities, and a variety of other cross-origin credentials.

### Add Credential Handler

You can add a Credential Handler by calling the
`CredentialManager.requestPermission()` API. This call will ensure that the
individual using the browser explicitly confirms that they want to use the
website as a credential handler.

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
