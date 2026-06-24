/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {_createInteract} from '../../lib/interact.js';
import {strict as assert} from 'node:assert';
import test from 'node:test';

// The imperative shell. It is built around an injected `credentials`
// container (the RPC seam) and an injected `assertSecureContext` so it can be
// exercised without a browser. See docs/specs/interact-api.md.

const URL_OK = 'https://exchange.example/abc';

function makeCredentials(impl) {
  return {get: impl};
}

// a secure-context assertion that passes, for the happy paths
const secure = () => {};

test('translates to credentials.get() with the interact request', async () => {
  let received;
  const interact = _createInteract({
    credentials: makeCredentials(async options => {
      received = options;
      return {selected: true};
    }),
    assertSecureContext: secure
  });
  await interact({interactionUrl: URL_OK});
  assert.deepEqual(received, {
    web: {protocols: {interact: URL_OK}}
  });
});

test('passes recommendedHandlerOrigins through to get()', async () => {
  let received;
  const interact = _createInteract({
    credentials: makeCredentials(async options => {
      received = options;
      return {selected: true};
    }),
    assertSecureContext: secure
  });
  await interact({
    interactionUrl: URL_OK,
    recommendedHandlerOrigins: ['https://wallet.example']
  });
  assert.deepEqual(
    received.web.recommendedHandlerOrigins, ['https://wallet.example']);
});

test('resolves to an empty object on completion', async () => {
  const interact = _createInteract({
    credentials: makeCredentials(async () => ({some: 'credential'})),
    assertSecureContext: secure
  });
  const result = await interact({interactionUrl: URL_OK});
  // minimal contract: resolves to {} regardless of what get() returned
  assert.deepEqual(result, {});
});

test('rejects with AbortError when signal is already aborted', async () => {
  let called = false;
  const interact = _createInteract({
    credentials: makeCredentials(async () => {
      called = true;
      return null;
    }),
    assertSecureContext: secure
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () => interact({interactionUrl: URL_OK, signal: controller.signal}),
    e => e.name === 'AbortError');
  // must not even call get() if already aborted
  assert.equal(called, false);
});

test('rejects with AbortError when signal fires mid-flight', async () => {
  const controller = new AbortController();
  const interact = _createInteract({
    // a get() that never settles on its own
    credentials: makeCredentials(() => new Promise(() => {})),
    assertSecureContext: secure
  });
  const promise = interact({
    interactionUrl: URL_OK, signal: controller.signal
  });
  controller.abort();
  await assert.rejects(promise, e => e.name === 'AbortError');
});

test('rejects with AbortError when get() resolves null', async () => {
  // when no credential is selected, get() resolves null; interact() treats
  // that as a user cancel and rejects with AbortError
  const interact = _createInteract({
    credentials: makeCredentials(async () => null),
    assertSecureContext: secure
  });
  await assert.rejects(
    () => interact({interactionUrl: URL_OK}),
    e => e.name === 'AbortError');
});

test('propagates other get() errors unchanged', async () => {
  const err = new DOMException('Not implemented.', 'NotSupportedError');
  const interact = _createInteract({
    credentials: makeCredentials(async () => {
      throw err;
    }),
    assertSecureContext: secure
  });
  await assert.rejects(
    () => interact({interactionUrl: URL_OK}),
    e => e.name === 'NotSupportedError');
});

test('asserts secure context before doing anything', async () => {
  let getCalled = false;
  const interact = _createInteract({
    credentials: makeCredentials(async () => {
      getCalled = true;
      return null;
    }),
    assertSecureContext: () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    }
  });
  await assert.rejects(
    () => interact({interactionUrl: URL_OK}),
    e => e.name === 'SecurityError');
  assert.equal(getCalled, false);
});

test('rejects invalid interactionUrl via the builder', async () => {
  const interact = _createInteract({
    credentials: makeCredentials(async () => null),
    assertSecureContext: secure
  });
  await assert.rejects(
    () => interact({interactionUrl: 'http://insecure.example'}),
    /https:/);
});
