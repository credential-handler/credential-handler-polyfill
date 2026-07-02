# Deprecated: `get()` and `store()`

> **⚠️ Deprecated.** Relying parties should use
> [`interact()`](../README.md#requesting-and-storing-credentials-with-interact)
> instead. A single
> [interaction URL](https://w3c.github.io/vcalm/#interaction-url-format) covers
> credential request, storage, or both (the operation is deferred to the
> exchange layer), so the `get()` / `store()` distinction is no longer needed.
> These lower-level entry points remain available for now and are documented
> here for existing integrations.

A web application can `get()` and `store()` credentials without knowing anything
about the user's wallet. This is intentional; for privacy reasons, the client
app must not be able to query any information (without user consent) about which wallets or
credential handlers a user may have installed (otherwise, fingerprinting and
other attacks would be possible).

## `get()`

A web app (a Relying Party or **verifier**) can request a credential using
`credentials.get()` during a user gesture event, for example when the user
pushes a button on a page that requires identity attributes or authentication.

```js
const credentialQuery = {
  // "web" means to ask the user to select a credential handler, aka
  // "wallet", that can provide Web-based credentials (as opposed to
  // asking for a local stored password or 2FA credential)
  web: {
    // one type of Web-based credential that can be asked for is a
    // "VerifiablePresentation" that contains Verifiable Credentials
    VerifiablePresentation: {
      // this data is not read or understood by the credential mediator;
      // it must be understood by the user-selected credential handler;
      // this example uses the Verifiable Presentation Request (VPR) format;
      // any other JSON-based format can also be used
      query: [{
        type: "QueryByExample",
        credentialQuery: {
          reason: "A university degree is required to complete your application.",
          example: {
            "@context": [
              "https://www.w3.org/2018/credentials/v1",
              "https://www.w3.org/2018/credentials/examples/v1"
            ],
            "type": ["UniversityDegreeCredential"]
          }
        }
      ]
    },
    // these are optional credential handler origins that can be recommended to
    // the user if they don't have a credential handler, aka "wallet", they
    // want to use already
    recommendedHandlerOrigins: [
      "https://wallet.example.chapi.io"
    ],
    // these are optional protocol URLs that will be passed to credential
    // handlers that have registered their "credential_handler.acceptedInput"
    // type as "url" in their web app manifest (instead of the default
    // "event"); these credential handlers do not communicate with the mediator
    // via events, but rather instead receive these "protocols" as a query
    // parameter appended to their registered "credential_handler.url";
    // additionally, the registered credential handler must have specified
    // a matching protocol via "credential_handler.acceptedProtocols", e.g.,
    // `"credential_handler": {"acceptedProtocols": ["OID4VCI"], ...}`
    protocols: {
      OID4VCI: 'openid-initiate-issuance://?issuer=https%3A%2F%2Fexample.edu%2Foid4vci-example&credential_type=https%3A%2F%2Fexample.org%2Fexamples%23UniversityDegreeCredential&pre-authorized_code=not_real_12345',
      vcapi: 'https://vcapi.example/exchanges/zc32763fhjsdfa2wf32/exchange/zcx6wef73f632f23f23f'
    }
  }
};
const webCredential = await navigator.credentials.get(credentialQuery);

if(!webCredential) {
  console.log('no credentials received');
}

// the `webCredential.data` property will hold the query-specific
// response such as a `VerifiablePresentation`
```

## `store()`

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

## WebCredential

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

const options = {
  // optionally include `recommendedHandlerOrigins` so the user can choose an
  // applicable wallet if they don't have one yet:
  recommendedHandlerOrigins: [
    'https://wallet.example.chapi.io'
  ],
  // these are optional protocol URLs that will be passed to credential
  // handlers that have registered their "credential_handler.acceptedInput"
  // type as "url" in their web app manifest (instead of the default "event");
  // these credential handlers do not communicate with the mediator via events,
  // but rather instead receive these "protocols" as a query parameter appended
  // to their registered "credential_handler.url"; additionally, the registered
  // credential handler must have specified a matching protocol via
  // "credential_handler.acceptedProtocols", e.g.,
  // `"credential_handler": {"acceptedProtocols": ["OID4VCI"], ...}`
  protocols: {
    OID4VCI: 'openid-initiate-issuance://?issuer=https%3A%2F%2Fexample.edu%2Foid4vci-example&credential_type=https%3A%2F%2Fexample.org%2Fexamples%23UniversityDegreeCredential&pre-authorized_code=not_real_12345',
    vcapi: 'https://vcapi.example/exchanges/zc32763fhjsdfa2wf32/exchange/zcx6wef73f632f23f23f'
  }
};
const webCredential = new WebCredential(
  'VerifiablePresentation', presentation, options);
```

## Handling Empty Results

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
