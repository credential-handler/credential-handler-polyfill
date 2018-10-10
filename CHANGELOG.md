# credential-handler-polyfill ChangeLog

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
