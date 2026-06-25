/*!
 * Pure request-construction for the `interact()` API. Builds a
 * `CredentialRequestOptions` for `navigator.credentials.get()` from an
 * interaction URL, with no mediator, no `navigator`, and no network -- so it
 * is independently testable. See docs/specs/interact-api.md.
 *
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */

/**
 * Builds the `get()` request that carries an interaction URL.
 *
 * The URL is placed in the `protocols` map under the well-known `interact`
 * key (a "meta" protocol); the polyfill treats it as opaque and does not
 * parse, encode, or decode it. Any underlying exchange protocol stays hidden
 * behind the URL.
 *
 * @param {object} options - The options to use.
 * @param {string} options.interactionUrl - An `https:` interaction URL.
 * @param {string[]} [options.recommendedHandlerOrigins] - Optional handler
 *   origins to recommend to the user.
 *
 * @returns {object} A `CredentialRequestOptions` for `credentials.get()`.
 */
export function createInteractRequest({
  interactionUrl, recommendedHandlerOrigins
} = {}) {
  if(typeof interactionUrl !== 'string') {
    throw new TypeError('"interactionUrl" must be a string.');
  }
  // validate the scheme only; the value is otherwise treated as opaque and
  // stored byte-for-byte (the original string, not a re-serialized URL)
  let parsed;
  try {
    parsed = new URL(interactionUrl);
  } catch(cause) {
    const error = new Error(
      '"interactionUrl" string must be a valid "https:" URL.');
    error.cause = cause;
    throw error;
  }
  if(parsed.protocol !== 'https:') {
    throw new Error('"interactionUrl" protocol must be "https:".');
  }
  if(recommendedHandlerOrigins !== undefined &&
    !(Array.isArray(recommendedHandlerOrigins) &&
      recommendedHandlerOrigins.every(s => URL.parse(s) !== null))) {
    throw new TypeError(
      '"recommendedHandlerOrigins" must be an array of URL strings.');
  }

  const web = {protocols: {interact: interactionUrl}};
  if(recommendedHandlerOrigins !== undefined) {
    web.recommendedHandlerOrigins = recommendedHandlerOrigins;
  }
  return {web};
}
