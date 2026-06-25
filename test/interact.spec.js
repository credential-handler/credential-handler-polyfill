/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {expect, test} from '@playwright/test';

// Smoke test for the simplified `interact()` API wiring (PR #57). Verifies
// that loading exposes `interact` on the returned polyfill object and, when
// installing, at `globalThis.chapi`; that `install: false` attaches nothing;
// and that input validation reaches through the built bundle. The pure
// builder and shell logic are covered exhaustively by the node:test unit
// tests in test/node/; this only checks the wiring.

test('loadOnce() exposes interact() on the polyfill and globalThis.chapi',
  async ({page}) => {
    await page.goto('/test/fixtures/index.html');

    const result = await page.evaluate(async () => {
      const polyfill = await window.credentialHandlerPolyfill.loadOnce();
      return {
        returnedInteractIsFn: typeof polyfill.chapi?.interact === 'function',
        globalInteractIsFn: typeof globalThis.chapi?.interact === 'function',
        // both paths share one implementation
        sameChapi: polyfill.chapi === globalThis.chapi
      };
    });

    expect(result.returnedInteractIsFn).toBe(true);
    expect(result.globalInteractIsFn).toBe(true);
    expect(result.sameChapi).toBe(true);
  });

test('load({install: false}) attaches nothing globally', async ({page}) => {
  await page.goto('/test/fixtures/index.html');

  const result = await page.evaluate(async () => {
    const polyfill = await window.credentialHandlerPolyfill.load({
      mediatorOrigin: 'https://authn.io',
      install: false
    });
    return {
      returnedInteractIsFn: typeof polyfill.chapi?.interact === 'function',
      // nothing should have been attached to the global environment
      noGlobalChapi: globalThis.chapi === undefined,
      noPolyfillGlobal: navigator.credentialsPolyfill === undefined
    };
  });

  expect(result.returnedInteractIsFn).toBe(true);
  expect(result.noGlobalChapi).toBe(true);
  expect(result.noPolyfillGlobal).toBe(true);
});

test('interact() rejects a non-https interactionUrl through the bundle',
  async ({page}) => {
    await page.goto('/test/fixtures/index.html');

    const error = await page.evaluate(async () => {
      await window.credentialHandlerPolyfill.loadOnce();
      try {
        await globalThis.chapi.interact({
          interactionUrl: 'http://insecure.example/abc'
        });
        return null;
      } catch(e) {
        return e.message;
      }
    });

    expect(error).toContain('https:');
  });

test('interact() rejects immediately when signal is already aborted',
  async ({page}) => {
    await page.goto('/test/fixtures/index.html');

    const name = await page.evaluate(async () => {
      await window.credentialHandlerPolyfill.loadOnce();
      const controller = new AbortController();
      controller.abort();
      try {
        await globalThis.chapi.interact({
          interactionUrl: 'https://exchange.example/abc',
          signal: controller.signal
        });
        return null;
      } catch(e) {
        return e.name;
      }
    });

    expect(name).toBe('AbortError');
  });
