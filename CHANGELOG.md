# credential-handler-polyfill ChangeLog

## 4.0.0 - 2024-07-02

### Changed
- **BREAKING**: Change to module.
- **BREAKING**: Update dependencies.
  - `web-request-rpc@3`

## 3.2.1 - 2024-06-12

### Fixed
- Ensure `navigator.credentials[get|store]` methods from the polyfill
  will continue to run and process `options.web|WebCredential`, even
  if those methods are changed by other software that runs after the
  polyfill is set up.

## 3.2.0 - 2023-03-09

### Added
- Add ability to send `protocols` option. This property can be used with
  requests or with a `WebCredential` to specify a dictionary of protocol
  URLs, where the keys in the dictionary are the protocol name and the
  values are the protocol URLs. These URLs will be passed to any credential
  handler that registers its `credential_handler.acceptedInput` (via its
  Web app manifest) as `url` instead of the default `event`.
- ***The `protocols` option is experimental and may change without a new
  major revision to the API.***

## 3.1.0 - 2023-01-17

### Fixed
- Throws error when loaded in an insecure context.

## 3.0.2 - 2022-11-17

### Fixed
- Use `web-request-rpc@2.0.2` to avoid chromium mouse event bug.

## 3.0.1 - 2022-11-09

### Fixed
- Use `web-request-rpc@2.0.1` to avoid chromium-based browser focus bug.

## 3.0.0 - 2022-06-13

### Changed
- **BREAKING**: Deprecate and make hints and registration APIs ineffectual.
  Registering a credential handler now only involves successfully asking
  the user to allow `credentialhandler` permission -- and providing a
  valid `credential_handler` section in `manifest.json`. Hints are no longer
  used and there is no `registration` API. An effort has been made to prevent
  existing code from breaking if it uses these APIs. Prior to this release
  using these APIs to add hints or registrations was largely ineffectual or
  at least unreliable as all that was required to ensure that a credential
  handler showed up in the mediator UI chooser was the presence of any
  hint or the use of `credential_handler` in `manifest.json` (plus a
  recommendation from a relying party when calling the `get` or `store`
  credential API. This has been simplified now -- and to a large extent
  existing code will continue to function as it did before. This is especially
  true for most users as the behavior for the Chrome browser is the least
  changed; other browsers that request permission from a credential handler
  site (aka digital wallet site) will see those permission requests always
  result in prompting the user -- as other browsers do not have access to
  storage to check for a previously saved permission value. The corrective
  course of action is to move any such code that wasn't previously hidden
  behind user activation behind one (e.g. a button / click / tap).

## 2.3.0 - 2022-01-18

### Added
- Add option to pass `mediatorOrigin` as an option to load functions.

## 2.2.1 - 2021-05-16

### Fixed
- Fix options passed to `WebCredential`.

## 2.2.0 - 2021-05-16

### Added
- Add ability to send `recommendedHandlerOrigins`. This property can be used
  with requests or with a `WebCredential` to specify an array of credential
  handler origins (up to 3 will be accepted by the mediator) to recommend.

## 2.1.3 - 2021-01-22

### Changed
- Update dependencies.

## 2.1.2 - 2021-01-22

### Changed
- Update dependencies.

## 2.1.1 - 2019-10-01

### Changed
- Update dependencies.

## 2.1.0 - 2019-08-16

### Added
- Add a default mediator url for the polyfill.

## 2.0.0 - 2019-08-13

### Changed
- Use webpack UMD target with `credentialHandlerPolyfill` name.

## 1.0.4 - 2018-10-10

### Changed
- Darken backdrop for mediator window.

## 1.0.3 - 2018-08-08

### Changed
- Up mediator load timeout to 30 seconds.

## 1.0.2 - 2018-07-27

### Fixed
- Add missing `PermissionManager.js`.

## 1.0.1 - 2018-07-25

### Changed
- Allow polyfill load to happen in parallel with
  relying party site load.

## 1.0.0 - 2018-07-20

### Changed
- Update dependencies.

## 0.1.8 - 2018-07-16

### Added
- Build browser file with webpack.
- Distribute plain min.js bundle (requires browser async/await support).

## 0.1.7 - 2018-07-15

### Fixed
- Fix native get() recursion.

## 0.1.6 - 2017-09-04

### Fixed
- Remove logging.

## 0.1.5 - 2017-09-04

### Added
- Include credential request origin. TBD how
  origin will be blinded; but will still be included
  for targeting during signing of verifiable profile.

## 0.1.4 - 2017-09-03

### Added
- Auto-install polyfill.

## 0.1.3 - 2017-08-29

### Fixed
- Fix bug in `imageToDataUrl`.

## 0.1.2 - 2017-08-22

### Changed
- Do not inherit custom events from `Event`.

## 0.1.1 - 2017-08-21

### Changed
- Prefetch icons.
- Allow `null` credential response.

## 0.1.0 - 2017-08-18

## 0.0.2 - 2017-08-18

### Changed
- Update deps.

## 0.0.1 - 2017-08-18

### Added
- Add core files.

- See git history for changes previous to this release.
