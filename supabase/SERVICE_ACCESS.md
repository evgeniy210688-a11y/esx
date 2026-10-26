# One-time access to an existing directory listing

## Server setup

Apply `migrations/20261026_service_invites.sql` in this project's Supabase SQL Editor. This uses the existing listings, admins and owners tables. The old generated-access migration is not required for new invitations; existing owners remain untouched.

Set these **server-only** Vercel environment variables, then redeploy:

- `SUPABASE_SERVICE_ROLE_KEY`: the same Supabase project's service-role key.
- `SERVICE_ACCESS_ENCRYPTION_KEY`: 32 random bytes encoded as 64 hexadecimal characters. Generate privately with Node crypto.randomBytes(32).toString('hex'). Never paste keys into chat or commit them.

Without these variables and migration, the panel reports setup required and does not issue credentials.

## Flow

1. Administrator selects a saved company or specialist and generates access without an email.
2. Administrator copies the temporary login/password and `/account/activate` URL to the owner. Unused credentials expire in 7 days.
3. First successful login atomically consumes the credentials, clears their encrypted password and hash, and sets a random HttpOnly activation cookie. A second login fails, including concurrent attempts. The activation window lasts 24 hours in the same browser.
4. Owner enters their real email and new password, confirms the email using Supabase's existing confirmation flow, and explicitly connects the selected listing. An already-registered owner can use their verified account instead; its password is not changed.
5. The server verifies the permanent Supabase session and atomically creates ownership of exactly the invited listing. The activation cookie is cleared. Subsequent login uses the owner's email/password. Administrators never see the permanent password.

If credentials expire or the owner loses the browser session before finishing, the administrator refreshes the panel and generates a replacement. This revokes the previous unclaimed activation session. Existing listing owners cannot be replaced through this feature.

## Security and validation

The invitation table and all three invitation functions allow service_role only, with RLS enabled and no client grants. Public endpoints never return Supabase service credentials. Login and password are randomly generated with 96 and 144 bits of entropy respectively. Password verification hashes bind the password to its login. Encrypted admin-readable temporary passwords use AES-256-GCM with listing ID as associated data; they are removed on redemption. Activation tokens contain 256 random bits and only their hashes are stored. Issuance and final ownership assignment lock the listing in a transaction. All responses are no-store. POST requests require a matching Origin.

Run `node scripts/test-service-invites.cjs` and `npx tsc --noEmit` locally. The route tests use mocked clients and do not validate actual PostgreSQL transactions. After deployment, test using a designated test listing: generate without email, redeem once, reject repeated/concurrent login, complete email verification, claim, verify only that listing's ownership, reject reuse after claim, and verify replacement revokes an unfinished activation. Do not use real companies for testing without authorization.
