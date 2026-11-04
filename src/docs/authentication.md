# Authentication

One app registration is both the SPA public client and this API. You can split them later. Today there is a single `EntraId:ClientId`.

The portal clicks, the user-secrets commands, and the redirect URI are in [../ReadMe.md](../ReadMe.md). This file is the model.

## What the API does with a token

`Program` registers `AddMicrosoftIdentityWebApi` on the `EntraId` configuration section. Inbound claim mapping is off (`JwtSecurityTokenHandler.DefaultMapInboundClaims = false`), so claim names stay as Entra sent them.

On `OnTokenValidated`:

- `RoleMapping.GetRolesFromClaims` reads `RoleMappings` in `appsettings.json`. Each entry is an app role plus the Entra group names or ids that grant it.
- Those roles are added as role claims.
- The identity name is `email`, then `upn`, then `unique_name`.

`OnMessageReceived` copies `access_token` from the query string when the path is `/hub`, because the browser's WebSocket cannot set an `Authorization` header.

`EnableTokenAcquisitionToCallDownstreamApi` plus `AddMicrosoftGraph` is the on-behalf-of path for avatars. It needs `EntraId:ClientSecret` and Graph `User.Read`. Without the secret, avatar code skips Graph and falls through to Gravatar and initials. The secret is never sent to the SPA.

## What the SPA is allowed to know

`GET /api/settings` returns `clientId`, `authority`, and `apiScope`. The SPA builds MSAL from that. It does not have its own copy of the tenant id or the secret.

Browser sign-in behavior (the one-second wait, the silent iframe, when a redirect is allowed) is documented on the SPA side, in `spa-src/docs/auth.md`. Change it there. Do not "fix" a login loop by loosening token validation on this API.
