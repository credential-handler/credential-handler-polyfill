## Motivation and Background

The Credential Handler API was created to achieve the following goals:

#### Goal 1: Make using credentials easier and safer for users

Credential management is becoming fundamental to a new generation of web 
applications. Users need the ability to safely store and manage credentials 
(from diplomas to coupons), and they need a consistent trusted UI (aka "trusted 
chrome" in industry parlance) to do that.

#### Goal 2: Give users ability to choose their wallet provider

Just as it's important for users to have choice of music players, web browsers,
PDF viewers, and so on, it's crucial for them to be able to choose service
providers for wallets and credential storage (with safeguards and sane defaults).

#### Goal 3: Give web app developers a standard wallet API

Web app developers should not be required to roll their own wallet 
infrastructure for every application. Using a standard credential management
API allows developers to:

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

* Credential Management Level 1 API
* Verifiable Credentials
* DIDs
* using CHAPI to solve the [NASCAR problem](https://indieweb.org/NASCAR_problem), 
  to streamline and preserve Web app state during 
  [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html) logins
  and OAuth2 interactions.
