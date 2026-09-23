# Email/password registration and permanent account QR

Owner choice on 2026-09-21: username, email, password, password confirmation, then a six-digit code sent by email. Successful code verification signs the user in and opens the account. No additional registration fields are required.

## Flow
- /account has Register and Sign in tabs. Signup collects username, email, password and password confirmation. Username is normalized and stored as profile display metadata; it is not a unique authentication identifier. Sign-in remains email/password, and authorization never relies on editable metadata.
- Supabase handles password hashing, confirmation and sessions; the app never stores passwords.
- Signup stores the selected interface language in user metadata for the confirmation email. The form and code screen support all eight site languages.
- Signup and resend send the confirmation OTP. The app calls `verifyOtp({ email, token, type: 'email' })`; Supabase creates a session and the existing auth listener opens the account. A validated /connect or /messages destination is still preserved when registration began from an invitation.
- Confirmation requires exactly six digits, including leading zeroes. Invalid/expired codes leave the user on the code screen with a translated error. A confirmed account can subsequently sign in with email/password.
- Confirmation screen supports resend with 60-second UI cooldown. Supabase rate limits remain the actual enforcement.
- Photos are added/changed/removed in the cabinet after email confirmation.

## Hosted email configuration
Verified in the dashboard on 2026-09-21: Confirm email enabled; custom SMTP enabled with smtp.resend.com, port 465, sender name ESX, and a 60-second minimum interval. SMTP credentials were not read or changed.
Updated and saved the Confirm sign up template to `supabase/templates/confirmation.html`, with subject `ESX · {{ .Token }}`. The template uses the selected language and displays `{{ .Token }}` instead of a confirmation link. Set Email OTP length to 6; expiration remains 3600 seconds.
Deploy the updated application together with these hosted settings. Actual inbox delivery and live code-to-session verification still require an end-to-end mailbox test. Do not commit SMTP credentials.
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
- /auth/callback: legacy email-link code exchange and validated redirect; new registrations use the in-page OTP form.
- /connect/<token>: scanning opens a guest session automatically when no session exists, then opens the canonical private conversation for the pair. No registration form is required.
- /messages/<id>: private messages enforced by RLS.

## Checks
node --test tests/registration.test.cjs tests/account-path.test.cjs tests/translate-route.test.cjs
npm run build
With a test mailbox: check delivered six-digit code, invalid/expired code, resend, automatic account entry after verification, password sign-in, unchanged QR and invitation continuation.

## Guest scanning (2026-09-22)
- `migrations/20260922_guest_chat.sql` is already present in the hosted database, verified on 2026-09-23 through its RPC and rolled-back behavioral checks. Do not rerun it. It removes QR tokens from anonymous profiles, preserves existing registered users' QR tokens, and exposes only participant logins through a membership-checked RPC. Profile RLS stays owner-only.
- Enable **Authentication → Sign In / Providers → Anonymous Sign-Ins** in Supabase. This is required for `signInAnonymously()`; the anonymous session still uses authenticated RLS and can access only its own conversations. No service-role key is needed in the app.
- Registered participants' logins are displayed above messages. Temporary rooms store the server-assigned login for new messages; old messages have no recoverable sender identity.
- Guest sessions persist in the current browser. Clearing browser data or signing out loses guest access. Registering a new account uses the existing signup flow and starts separate account history; guest chats are not migrated.
- The account page offers registration to guests for a permanent QR and links to their current guest conversations.
- Enabled Anonymous Sign-Ins in the hosted Supabase dashboard on 2026-09-23 with owner approval. Guest sessions use the authenticated role and the participant-only RLS checks described below. Only the public project URL and publishable key are configured locally.
- Hosted transactional checks passed on 2026-09-23: guest QR is null, repeated scans reuse a conversation, registered login is visible only to participants, guest metadata cannot spoof a registered login, unrelated guests cannot read/write the conversation, upgraded guests receive a QR, and the owner's QR remains unchanged. All synthetic fixtures were rolled back.
- If guest sign-in fails, the QR screen offers retry and account sign-in with the invitation preserved. A response without a session is treated as a failed sign-in. Guest account loading errors also offer retry.
- Run `node --test tests/guest-session.test.cjs tests/registration.test.cjs tests/account-path.test.cjs tests/translate-route.test.cjs`, `npx tsc --noEmit`, and `npm run build`. Run `tests/guest-chat.sql` against the migrated database; its synthetic data rolls back.
