/*!
 * The `interact()` API: a simplified, single-call CHAPI entry point that
 * starts a credential interaction from an interaction URL. The imperative
 * shell here wires the pure request builder to the existing `get()` RPC and
 * maps the result/abort to the resolution contract. See
 * docs/specs/interact-api.md.
 *
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {createInteractRequest} from './interactRequest.js';

/**
 * Asserts the current context is secure (HTTPS/TLS), matching the existing
 * polyfill behavior.
 */
export function assertSecureContext() {
  if(!globalThis.isSecureContext) {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  }
}

/**
 * Builds an `interact()` function bound to a given credentials container.
 * Exported (with a leading underscore) for testing the imperative shell
 * without a browser; production code reaches `interact()` via the chapi
 * object returned from `load()`/`loadOnce()` or the standalone factory.
 *
 * @param {object} options - The options to use.
 * @param {object} options.credentials - A credentials container exposing
 *   `get(CredentialRequestOptions)` (the RPC seam).
 * @param {Function} [options.assertSecureContext] - Secure-context assertion;
 *   defaults to the real check.
 *
 * @returns {Function} The `interact()` function.
 */
export function _createInteract({
  credentials, assertSecureContext: assertSecure = assertSecureContext
} = {}) {
  /**
   * Starts a credential interaction.
   *
   * @param {object} options - The options to use.
   * @param {string} options.interactionUrl - An `https:` interaction URL.
   * @param {AbortSignal} [options.signal] - Aborts the interaction.
   * @param {string[]} [options.recommendedHandlerOrigins] - Optional handler
   *   origins to recommend to the user.
   *
   * @returns {Promise<object>} Resolves to an empty object on completion;
   *   rejects with an `AbortError` on cancel/abort.
   */
  return async function interact({
    interactionUrl, signal, recommendedHandlerOrigins
  } = {}) {
    assertSecure();

    // build the request before touching the signal so invalid input fails
    // fast with a synchronous validation error
    const request = createInteractRequest({
      interactionUrl, recommendedHandlerOrigins
    });

    // reject immediately if already aborted; surfaces the signal's own
    // `reason` (a `DOMException` named `AbortError` by default)
    signal?.throwIfAborted();

    // race the in-flight RPC against the abort signal so an abort rejects
    // promptly rather than waiting on the indefinite-timeout `get()`
    const credential = await _withAbort(credentials.get(request), signal);

    if(!credential) {
      // no credential selected: treat as a user cancel
      throw _abortError();
    }

    // minimal resolution contract: resolve to an empty object for now; the
    // shape is reserved for future expansion and intentionally returns no
    // credential data to the relying party
    return {};
  };
}

function _abortError() {
  return new DOMException('The operation was aborted.', 'AbortError');
}

/**
 * Rejects as soon as `signal` fires, otherwise settles with `promise`.
 *
 * @param {Promise} promise - The in-flight operation.
 * @param {AbortSignal} [signal] - Optional abort signal.
 *
 * @returns {Promise} The race result.
 */
function _withAbort(promise, signal) {
  if(!signal) {
    return promise;
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(_abortError());
    signal.addEventListener('abort', onAbort, {once: true});
    promise.then(resolve, reject).finally(
      () => signal.removeEventListener('abort', onAbort));
  });
}
