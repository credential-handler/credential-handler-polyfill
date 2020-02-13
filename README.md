# Credential Handler API polyfill _(credential-handler-polyfill)_

> [Credential Handler API](https://w3c-ccg.github.io/credential-handler-api/) (CHAPI) polyfill for browsers

## Table of Contents

- [Demo](#demo)
- [Background](#background)
- [Usage](#usage)
- [Install](#install)
- [Security](#security)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Demo

For an idea of what a minimal CHAPI implementation looks like, visit:

1. https://chapi-demo-wallet.digitalbazaar.com/
2. https://chapi-demo-issuer.digitalbazaar.com/
2. https://chapi-demo-verifier.digitalbazaar.com/

## Background

Credential Handler API (CHAPI) is:

* a browser API
* lets web apps securely `get()` and `store()` credentials, without
  having to roll their own wallet infrastructure
* provides a secure _trusted UI_ for users to manage those credentials
* gives users ability to choose service providers for wallets

Read more: [CHAPI Motivation and Background](docs/motivation-and-background.md).

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

```js
const webCredential = new WebCredential('VerifiableCredential', {
  '@context': 'https://w3id.org/credentials/v1',
  ...credential
});
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
user for permission to install, to activate the handler, and so on.

#### Requesting Permission and Registering the Handler

```js
const {CredentialManager, CredentialHandlers} = polyfill;

const result = await CredentialManager.requestPermission();
if(result !== 'granted') {
  throw new Error('Permission denied.');
}

// get credential handler registration
const registration = await CredentialHandlers.register('/credential-handler');
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
