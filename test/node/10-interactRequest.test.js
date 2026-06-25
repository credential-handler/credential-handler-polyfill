/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {strict as assert} from 'node:assert';
import {createInteractRequest} from '../../lib/interactRequest.js';
import test from 'node:test';

// The pure functional core: it builds a `CredentialRequestOptions` for
// `navigator.credentials.get()` from an interaction URL, with no mediator,
// no `navigator`, and no network. See docs/specs/interact-api.md.

test('places interactionUrl under the `interact` protocols key', () => {
  const options = createInteractRequest({
    interactionUrl: 'https://exchange.example/abc'
  });
  assert.deepEqual(options, {
    web: {
      protocols: {interact: 'https://exchange.example/abc'}
    }
  });
});

test('includes recommendedHandlerOrigins when provided', () => {
  const options = createInteractRequest({
    interactionUrl: 'https://exchange.example/abc',
    recommendedHandlerOrigins: ['https://wallet.example']
  });
  assert.deepEqual(options, {
    web: {
      protocols: {interact: 'https://exchange.example/abc'},
      recommendedHandlerOrigins: ['https://wallet.example']
    }
  });
});

test('omits recommendedHandlerOrigins when not provided', () => {
  const options = createInteractRequest({
    interactionUrl: 'https://exchange.example/abc'
  });
  assert.equal('recommendedHandlerOrigins' in options.web, false);
});

test('produces only the single-key `interact` protocols object', () => {
  const {protocols} = createInteractRequest({
    interactionUrl: 'https://exchange.example/abc'
  }).web;
  assert.deepEqual(Object.keys(protocols), ['interact']);
});

test('treats interactionUrl as opaque (does not parse or re-encode)', () => {
  // a URL with query/fragment must pass through byte-for-byte
  const url = 'https://exchange.example/abc?x=1&y=2#frag';
  const options = createInteractRequest({interactionUrl: url});
  assert.equal(options.web.protocols.interact, url);
});

test('throws TypeError when interactionUrl is missing', () => {
  assert.throws(() => createInteractRequest({}), TypeError);
});

test('throws TypeError when interactionUrl is not a string', () => {
  assert.throws(
    () => createInteractRequest({interactionUrl: 42}), TypeError);
});

test('throws a protocol error when interactionUrl is not https:', () => {
  assert.throws(
    () => createInteractRequest({interactionUrl: 'http://exchange.example'}),
    /protocol must be "https:"/);
});

test('throws a parse error with a cause for a malformed URL', () => {
  assert.throws(
    () => createInteractRequest({interactionUrl: 'not a url'}),
    e => /must be a valid "https:" URL/.test(e.message) &&
      e.cause !== undefined);
});

test('throws when recommendedHandlerOrigins is not an array', () => {
  assert.throws(() => createInteractRequest({
    interactionUrl: 'https://exchange.example/abc',
    recommendedHandlerOrigins: 'https://wallet.example'
  }), TypeError);
});

test('throws when recommendedHandlerOrigins has a non-URL entry', () => {
  assert.throws(() => createInteractRequest({
    interactionUrl: 'https://exchange.example/abc',
    recommendedHandlerOrigins: ['https://wallet.example', 'not a url']
  }), /array of URL strings/);
});

test('accepts an array of valid URL-string origins', () => {
  const options = createInteractRequest({
    interactionUrl: 'https://exchange.example/abc',
    recommendedHandlerOrigins: ['https://wallet.example']
  });
  assert.deepEqual(
    options.web.recommendedHandlerOrigins, ['https://wallet.example']);
});
