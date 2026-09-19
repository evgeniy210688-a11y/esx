# Email/password registration and permanent account QR

Final owner choice on 2026-09-20: email and password with confirmation by email. Username and SMS registration have been removed. Confirm email was re-enabled in Supabase after this choice.

## Flow
- /account has Register and Sign in tabs. Signup collects username, email, password and password confirmation. Username is normalized and stored as profile display metadata; it is not a unique authentication identifier. Sign-in remains email/password, and authorization never relies on editable metadata.
- Supabase handles password hashing, confirmation and sessions; the app never stores passwords.
- Signup and resend use the browser client's PKCE flow and /auth/callback, preserving a validated /connect or /messages destination.
- Open the confirmation link in the same browser as signup. If the PKCE exchange fails, the account screen shows recovery instructions. A confirmed account can subsequently sign in with its email/password.
- Confirmation screen supports resend with 60-second UI cooldown. Supabase rate limits remain the actual enforcement.
- Photos are added/changed/removed in the cabinet after email confirmation.

## Launch blocker
Custom SMTP was not configured in the last verified dashboard state. Supabase's default sender is restricted and is not suitable for public signup. Configure an owner-controlled mail provider and verify actual confirmation delivery before claiming signup is live for everyone. Do not commit SMTP credentials.
Site URL: https://www.88esx.com/account. Allowed production redirect: https://www.88esx.com/auth/callback**. Local callback must be separately allowlisted for local email tests.

## Photos and privacy
JPEG/PNG/WebP files up to 10 MB are cropped and re-encoded as 320px JPEG without original metadata. A bounded data URL lives in the private profile, never auth JWTs. RLS allows only the owner to read or update their avatar. QR and user identity remain immutable.

## Database
- 20260915_private_accounts.sql applied previously; do not rerun.
- 20260920_account_photo.sql applied 2026-09-20; do not rerun.
- Avatar privacy/format checks passed in a rolled-back SQL transaction.
- Live API checks during the superseded username flow passed: password sign-in, duplicate rejection, stable QR, photo persistence/removal. They do NOT verify email confirmation delivery.
- One disposable QA identity remains: qa_mu8jef54@accounts.88esx.com (no personal data, random password not retained).

## Routes
- /account: email signup/signin, photo, permanent QR and inbox.
- /auth/callback: code exchange and validated redirect.
- /connect/<token>: authenticated scan opens canonical private conversation for the pair.
- /messages/<id>: private messages enforced by RLS.

## Checks
node --test tests/account-path.test.cjs tests/translate-route.test.cjs
npm run build
After SMTP setup: test delivered confirmation, invalid/expired link, resend, sign-in before/after confirmation, unchanged QR and invitation continuation.
