/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {expect, test} from '@playwright/test';

// Smoke test for the simplified `interact()` API wiring (PR #57). Verifies
// that `loadOnce()` exposes `interact` both on the returned polyfill object
// and as `navigator.chapi`, and that input validation reaches through the
// built bundle. The pure builder and shell logic are covered exhaustively by
// the node:test unit tests in test/node/; this only checks the wiring.

test('loadOnce() exposes interact() on the polyfill and navigator.chapi',
  async ({page}) => {
    await page.goto('/test/fixtures/index.html');

    const result = await page.evaluate(async () => {
      const polyfill = await window.credentialHandlerPolyfill.loadOnce();
      return {
        returnedInteractIsFn: typeof polyfill.chapi?.interact === 'function',
        navigatorInteractIsFn: typeof navigator.chapi?.interact === 'function',
        // both paths share one implementation
        sameChapi: polyfill.chapi === navigator.chapi
      };
    });

    expect(result.returnedInteractIsFn).toBe(true);
    expect(result.navigatorInteractIsFn).toBe(true);
    expect(result.sameChapi).toBe(true);
  });

test('interact() rejects a non-https interactionUrl through the bundle',
  async ({page}) => {
    await page.goto('/test/fixtures/index.html');

    const error = await page.evaluate(async () => {
      await window.credentialHandlerPolyfill.loadOnce();
      try {
        await navigator.chapi.interact({
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
        await navigator.chapi.interact({
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
