# Administrator-issued access

Apply `migrations/20261025_service_access.sql` in the project's Supabase SQL editor.
Configure these server-only environment variables in hosting (never NEXT_PUBLIC):

- `SUPABASE_SERVICE_ROLE_KEY`: service role key for the same Supabase project.
- `SERVICE_ACCESS_ENCRYPTION_KEY`: 32 random bytes encoded as 64 hexadecimal characters. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in a private terminal. Retain securely; changing it makes previously issued passwords unreadable.

Redeploy after configuration. The feature fails closed until configuration and migration are present.

Only a verified administrator can read or issue access. GET responses are not cached. Credentials use AES-256-GCM and are not exposed through client database grants. Each generated user receives ownership of exactly the selected listing. Existing owners/accounts are not reset or taken over. The email is the login accepted by the existing account form. No emails are sent automatically.

Validate with an explicitly designated test listing/email: generate access, sign in, verify the ownership row, reload the admin panel and retrieve credentials. Verify anonymous and non-admin requests fail and concurrent creation cannot assign two generated owners. Existing self-registered passwords cannot be recovered; credentials shown here are only those issued through this panel and may become obsolete if a user later changes their password.
