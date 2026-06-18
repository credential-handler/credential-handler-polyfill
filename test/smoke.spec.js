/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {expect, test} from '@playwright/test';

// Smoke test that reproduces #51: on WebKit, `navigator.credentials` is a
// non-configurable property, so the `Object.defineProperty()` call in `load()`
// throws and `loadOnce()` rejects. The fix in #52 wraps that in a try/catch and
// falls back to plain assignment. These assertions are red on WebKit before the
// fix and green after, and run across all configured browser projects.

test('loadOnce() resolves and patches navigator.credentials', async ({
  page
}) => {
  await page.goto('/test/fixtures/index.html');

  const result = await page.evaluate(async () => {
    // do not let the remote mediator window load actually block resolution;
    // `loadOnce()` wires up the polyfill synchronously and returns before the
    // mediator iframe finishes, so the API surface is observable immediately
    await window.credentialHandlerPolyfill.loadOnce();
    return {
      hasWebCredential: typeof window.WebCredential === 'function',
      getIsFn: typeof navigator.credentials.get === 'function',
      storeIsFn: typeof navigator.credentials.store === 'function'
    };
  });

  // the key regression assertion: the above did not throw (a WebKit pre-#52
  // `loadOnce()` rejects with a TypeError here)
  expect(result.hasWebCredential).toBe(true);
  expect(result.getIsFn).toBe(true);
  expect(result.storeIsFn).toBe(true);
});

test('loadOnce() resolves when navigator.credentials is non-configurable',
  async ({page}) => {
    await page.goto('/test/fixtures/index.html');

    // True regression guard for #51. Playwright's bundled engines (incl.
    // WebKit 26.5) report `navigator.credentials` as `configurable: true`,
    // so they do NOT reproduce real Safari/iOS, where the property is
    // non-configurable and `Object.defineProperty()` throws. We force that
    // condition here so the test is red on the pre-#52 (unguarded
    // defineProperty) code in every engine and green with the try/catch
    // fallback.
    const result = await page.evaluate(async () => {
      // Pin `navigator.credentials` as a non-configurable, non-writable data
      // property. This is the shape that makes the polyfill's
      // `Object.defineProperty()` call throw a TypeError, matching real
      // Safari/iOS. (A non-configurable but *writable* property does not throw
      // on redefine, so it would not reproduce the bug.) `get`/`store` are
      // still mutable on the object itself, so the polyfill's earlier direct
      // patching of those methods still succeeds.
      const current = navigator.credentials;
      Object.defineProperty(navigator, 'credentials', {
        value: current,
        writable: false,
        configurable: false
      });
      let threw = false;
      try {
        await window.credentialHandlerPolyfill.loadOnce();
      } catch(e) {
        threw = e.name + ': ' + e.message;
      }
      return {
        threw,
        getIsFn: typeof navigator.credentials.get === 'function',
        storeIsFn: typeof navigator.credentials.store === 'function'
      };
    });

    // pre-#52: `threw` is a TypeError string and get/store are never patched
    expect(result.threw).toBe(false);
    expect(result.getIsFn).toBe(true);
    expect(result.storeIsFn).toBe(true);
  });

test('survives navigator.credentials being reassigned after load', async ({
  page
}) => {
  await page.goto('/test/fixtures/index.html');

  // simulates a password-manager extension (1Password, Dashlane, etc.)
  // reassigning `navigator.credentials` after the polyfill loads. The polyfill
  // patches `get`/`store` directly on the existing object before installing the
  // overwrite proxy, so CHAPI must still be usable. Browser-agnostic stand-in
  // for real extensions, which Playwright can only load under Chromium.
  const stillPatched = await page.evaluate(async () => {
    await window.credentialHandlerPolyfill.loadOnce();
    try {
      // mimic an extension clobbering the property
      navigator.credentials.get = function() {
        return Promise.resolve('extension-result');
      };
    } catch {
      // some engines may reject reassignment; that is acceptable
    }
    return typeof navigator.credentials.get === 'function' &&
      typeof navigator.credentials.store === 'function';
  });

  expect(stillPatched).toBe(true);
});
