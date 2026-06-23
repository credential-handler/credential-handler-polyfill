# Spec: Simplified `interact()` API for interaction URLs
> Status: Draft — pending review by Engineering, DevOps, CTO, and Privacy Officer. Addresses [#50](https://github.com/credential-handler/credential-handler-polyfill/issues/50).
## Summary
Add a drastically simplified, single-call CHAPI entry point that lets issuer/verifier coordinator websites (relying parties) start a credential interaction by handing the polyfill an `interactionUrl`, without composing the full `web`/`VerifiablePresentation` request object themselves. The new `interact({interactionUrl, signal, recommendedHandlerOrigins, type})` method resolves when the interaction completes (to an empty object/`undefined` for now) or rejects with an `AbortError` when the user cancels or the caller aborts via an `AbortSignal`. Under the hood it translates into the existing `credentialrequest` (`get()`) flow — reusing the established `protocols` mechanism to carry the URL — so it is compatible with today's mediator and deployed credential handlers. The method is reachable two ways: attached at `navigator.chapi` after `loadOnce()`, and returned from a standalone factory export so callers can attach the API wherever they like (addressing the "avoid `navigator`" request in the issue thread).
## Implementation details & assumptions
### New public API
```js
// Shape (param names subject to bikeshedding per the issue):
await chapi.interact({
  interactionUrl,                 // required string (https: URL)
  signal,                         // optional AbortSignal
  recommendedHandlerOrigins,      // optional string[]
  type                            // optional 'request' | 'store', default 'request'
});
```

Resolution contract:

- **Resolves** to an empty object (or `undefined`) when the interaction completes for now. The return shape is intentionally minimal and reserved for future expansion; callers must not depend on a credential being returned yet.
  
- **Rejects** with a `DOMException` of name `AbortError` when the user cancels in the mediator UI, or when the caller aborts via `signal`.
  
- Other failures reject with the existing error types surfaced by `get()` (e.g. `NotSupportedError`, `SecurityError` from the secure-context assertion).
  
### Two ways to reach it (issue asks for both)
1. `navigator.chapi` — `load()`/`loadOnce()` attach a `chapi` object (containing `interact`) to `navigator` alongside the existing `navigator.credentialsPolyfill`, for parity with the current global pattern.
  
2. **Standalone factory** — a new export (working name `loadOnce`-style factory; final name TBD per the issue's bikeshedding note) returns the `chapi` object so callers can assign it wherever they want, e.g. `globalThis.chapi = await createChapi({...})`. This avoids forcing the `navigator` namespace, which the thread flags as prone to clobbering by password-manager extensions and browser security changes.
  
  Both paths share one implementation; `navigator.chapi` is just the factory result assigned to `navigator`.
  
### Translation to existing flow
- `type: 'request'` (default) → translate to a `navigator.credentials.get()` call with a `web` request.
  
- `type: 'store'` → reserved in the API now; wiring to `store()` is deferred to a follow-up (see Open questions). `interact()` validates and accepts the param but the spec does not commit to `store` behavior in this change.
  
- `interactionUrl` is carried via the **existing** `protocols` **map** (the query-param mechanism already used for URL-type credential handlers), not a new mediator field. This keeps the change client-side only — no mediator or RPC contract changes required for the initial release.
  
- `recommendedHandlerOrigins` passes straight through to the underlying request options, identical to current `get()`/`store()` semantics.
  
- `signal` is wired to the abort path: if already aborted, reject immediately; otherwise reject with `AbortError` when it fires.
  
### Functional-core / imperative-shell split
Per house practice, the request-construction logic is a **pure function** — `(interactionUrl, type, recommendedHandlerOrigins) → CredentialRequestOptions` — independently testable with no mediator, no `navigator`, no network. The imperative shell (`interact()`) does the secure-context check, awaits the RPC, and maps the result/abort to the resolution contract.
### Assumptions
- The deployed mediator and at least one URL-type credential handler already honor the `protocols` query-param mechanism (it is documented and shipped).
  
- `interactionUrl` is an `https:` URL the coordinator already trusts; the polyfill validates the scheme but does not fetch or interpret it.
  
- No top-level-await requirement is introduced beyond what `loadOnce()` already implies.
  
## Data flows
```
Coordinator page
  → chapi.interact({interactionUrl, ...})
    → pure builder → CredentialRequestOptions (interactionUrl placed in protocols)
    → CredentialsContainer.get(options)  [existing RPC]
    → web-request-rpc → Credential Mediator (authn.io) in cross-origin iframe
    → mediator → user selects handler / handler receives interactionUrl as
      query param on its registered URL
  ← resolve (empty) on completion | reject AbortError on cancel/abort
```

Trust boundaries (unchanged from existing `get()`):

- The coordinator page cannot enumerate the user's wallets/handlers (anti- fingerprinting); `recommendedHandlerOrigins` are _suggestions_ surfaced by the mediator UI, not a query of installed handlers.
  
- The mediator runs cross-origin and mediates all handler communication.
  
- `interactionUrl` crosses to the selected handler only after user selection.
  
## DB schema changes
None. This is a browser polyfill with no datastore.
## API endpoints and scope
No new server endpoints. Surface area is the client API only:

- New method `interact()` on the `chapi` object.
  
- New factory export (name TBD) returning the `chapi` object.
  
- New `navigator.chapi` global set during `load()`/`loadOnce()`.
  

No existing public methods change behavior; this is purely additive (no breaking change to `get()`, `store()`, `load()`, or `loadOnce()`).
## Personal information impact
The polyfill itself collects, stores, and persists **no** personal data. It is a message broker between the coordinator page and a cross-origin mediator.

- **Categories touched (in transit only):** `interactionUrl` and `recommendedHandlerOrigins` — neither is personal data by itself; they are endpoint/origin references chosen by the coordinator. Any personal data exchanged (e.g. a Verifiable Presentation) flows between the user-selected handler and the interaction endpoint, **not** through new code added here, and is not returned to the coordinator by `interact()` in this release.
  
- **Purpose:** initiate a user-consented credential interaction.
  
- **Storage:** none added. No new persistence, cookies, or localStorage.
  
- **Transmission:** over the existing cross-origin RPC channel; the secure- context assertion (`window.isSecureContext`) is retained, so HTTPS/TLS is required.
  
- **Data minimization:** `interact()` deliberately returns an empty result for now, returning _less_ to the coordinator than `get()` does, which reduces the data exposed to the relying party.
  
## Security considerations
- **How could this be misused?** A malicious coordinator could pass a hostile `interactionUrl`. Mitigation: the polyfill validates the scheme is `https:`, does not fetch or execute the URL, and the URL only reaches a credential handler _after explicit user selection_ in the trusted mediator UI. User consent remains the gate, unchanged from `get()`.
  
- **Attack surface / unnecessary data:** additive method reusing the existing RPC path; no new cross-origin channel, no new global beyond `navigator.chapi`. The empty-result contract avoids handing credential data to the relying party.
  
- **Trusted vs untrusted sources:** `interactionUrl` and `recommendedHandlerOrigins` are **untrusted** caller input — validated (scheme, type) before use, never interpolated into executable contexts. Results from the mediator are treated as today (validation TODOs in `CredentialsContainer` apply equally).
  
- **Anti-fingerprinting:** preserved — `interact()` gives the caller no way to learn which handlers the user has, consistent with the existing privacy model.
  
- `navigator` **clobbering:** the standalone factory export lets security- conscious callers avoid the `navigator` namespace entirely, reducing exposure to extension/browser interference noted in the issue.
  
## Open questions

These remain **open by design** and are to be resolved during the initial
review on the draft PR — they are not blockers to opening that draft.

1. **Final names.** `interact`, the factory export name, and the `type` values
   (`'request'`/`'store'`) are all flagged for bikeshedding in the issue. Names
   above are placeholders.
2. **`type: 'store'` wiring.** Should `store` translate to a `credentialstore`
   event in this change, or land as a documented-but-unimplemented param with a
   follow-up issue? Spec currently defers `store` behavior.
3. **Resolution payload.** Confirm `interact()` resolves to `{}` vs `undefined`,
   and whether a future version returns interaction results (and if so, what the
   minimal shape is).
4. **`interactionUrl` mapping key.** Under which `protocols` key should
   `interactionUrl` be placed for the mediator/handler to recognize it, and does
   any deployed handler need a manifest update to accept it?
5. **Performance for first-time calls.** The issue notes a no-`loadOnce()` path
   may incur first-call setup cost (injecting the mediator iframe/styles). Do we
   need a documented "warm-up" call, or is lazy initialization on first
   `interact()` acceptable?
6. **`signal` interaction with the RPC.** The current RPC `get` uses an
   indefinite timeout; confirm aborting `signal` cleanly tears down or abandons
   the in-flight RPC rather than leaking it.

---

_Next step: distribute this spec to Engineering, DevOps, CTO, and the Privacy Officer for review before any implementation begins._
