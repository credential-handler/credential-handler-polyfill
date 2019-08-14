# Credential Handler API polyfill _(credential-handler-polyfill)_

> [Credential Handler API](https://w3c-ccg.github.io/credential-handler-api/) (CHAPI) polyfill for browsers

## Table of Contents

- [Background](#background)
- [Demo](#demo)
- [Usage](#usage)
- [Install](#install)
- [Security](#security)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

Credential Handler API (CHAPI) is:

* a browser API
* lets web apps securely `get()` and `store()` credentials and keys, without
  having to roll their own wallet infrastructure
* provides a secure _trusted UI_ for users to manage those credentials
* gives users ability to choose service providers for wallets

The Credential Handler API was created to achieve the following goals:

#### Goal 1: Make using credentials and keys easier and safer for users

Key management and credential management are becoming fundamental to a new
generation of web applications. Users need the ability to safely store and
manage credentials (from diplomas to coupons) and cryptographic keys (for
digital signatures, passwordless logins, secure encryption and more), and
they need a consistent trusted UI (aka "trusted chrome" in industry parlance) to
do that.

#### Goal 2: Give users ability to choose their wallet provider

Just as it's important for users to have choice of music players, web browsers,
PDF viewers, and so on, it's crucial for them to be able to choose service
providers for wallets and credential storage (with safeguards and sane defaults).

#### Goal 3: Give web app developers a standard wallet API

Web app developers should not be required to roll their own wallet 
infrastructure for every application. Using a standard credential management
API allows developers to:

* Implement secure user account and login systems
* Minimize the risk of data leaks and identity theft
* Participate in the [Verifiable Credentials](https://w3c.github.io/vc-data-model/) 
  ecosystem  

#### About this Polyfill

TODO: Explain the importance of polyfills for driving innovation and standards
for the Web platform. (a.k.a, many of your favorite Web platform features
probably started out as a polyfill.) 

#### Relationship to Other Standards

TODO: Add section explaining how CHAPI interacts with existing complementary
web standards:

* WebAuthn and FIDO
* Credential Management Level 1 API
* Verifiable Credentials
* DIDs

## Demo

Visit https://digitalbazaar.github.io/credential-handler-polyfill/demo/ 
for an idea of what the basic handler UI looks like.

## Usage

### Loading the Polyfill

Before you can get and store credentials or keys, you need to load the
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
app must not have access to any information regarding which wallets or 
credential handlers a user may have installed (otherwise, fingerprinting and
other attacks would be possible).

#### `get()`

A web app (a Relying Party or **verifier**) can request a credential using
`credentials.get()`, for example when the user 
pushes a button on a page that requires identity attributes or authentication.

```js
const webCredential = await navigator.credentials.get({web: {}});

if(!webCredential) {
  console.log('no credentials received');
}
```

#### `store()`

A web app (for example, a credential **issuer** such as a university or 
institution) can ask to _store_ a credential, for example when the user pushes 
a button to receive a credential.

```js
const result = await navigator.credentials.store({web: {}});
if(!result) {
  console.log('store credential operation did not succeed');
}
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
  link/recommendation, perhaps in a popup window)
* (In case the user denied the request) Invite the user to re-try the operation,
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
const {CredentialManager, CredentialHandlers} = navigator.credentialsPolyfill;

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
<script src="https://unpkg.com/credential-handler-polyfill@2.0.0/dist/credential-handler-polyfill.min.js"></script>
```

### Installing using Node.js (for development)

To install as a dependency of another project, add this to your `package.json`:

```
"credential-handler-polyfill": "^2.0.0"
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
