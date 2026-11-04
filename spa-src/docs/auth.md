# Browser sign-in

The API validates the token and owns the secret. This file is only the browser. Server behavior is in `src/docs/authentication.md` of the API tree.

MSAL is built in `App.tsx` from `msalSettings` on `GET /api/settings`. `clientId`, `authority`, and `apiScope` are not in a frontend env file. `src/appConfig.ts` holds the shape and the SPA origin. `redirectUri` is the page origin. A top-level `redirectUri` outside `auth` is ignored by MSAL.

## Do not boot inside the silent iframe

`acquireTokenSilent` loads a hidden iframe. `main.tsx` skips `createRoot` when `window.parent !== window` and there is no `window.opener`. The parent reads that frame's URL. If the SPA boots there, it consumes the hash and sign-in breaks.

## Leave the one-second wait

`IdentityContext` calls `handleRedirectPromise`. A result means the redirect completed. A null result does not mean the user is signed out. The code waits one second, then reads `getAllAccounts`. Empty accounts set redirecting and call `handleLogin` after another 500ms. The comment in the file records why the wait is there. Leave it.

## One interactive redirect

`SessionContext` calls `acquireTokenSilent` with the signed-in `account`, the API scopes, and `redirectUri: window.location.origin`.

It starts `acquireTokenRedirect` only when the error is `InteractionRequiredAuthError` or the code is `invalid_grant`, and only once (`interactiveTokenStarted`). Any other error is logged and the call returns no token.

`timed_out`, `block_iframe_reload`, and `interaction_in_progress` are iframe plumbing. They are not a reason to send the user to Entra. Treating them as interaction, or clearing the hash yourself, is what produced the "We couldn't sign you in" loop.

If silent acquisition returns no token, `securityWorker` throws. The screen does not call the API anonymously by accident.
