# Private-message web push

Applied 2026-10-05: migration 20261005_push_notifications.sql and the esx-push Edge Function.
The function validates x-esx-push-secret for POST requests. GET returns only the VAPID public key. Gateway legacy JWT verification is disabled for this function because the webhook has its own secret authentication.
VAPID signing keys are generated once by the function and stored in esx_push_config, with no anon/authenticated access. Never expose or rotate them casually; changing them invalidates existing subscriptions.

Subscriptions use auth.uid() ownership RLS. New private-message inserts enqueue a pg_net call; only the other conversation participant receives a generic notification, without message text. Expired endpoints are removed. Temporary /chat rooms are not covered.

In private-chat settings, enable notifications on each device. On iPhone, install the site through Share / Add to Home Screen, open that icon, sign in to the same account, then enable notifications. A Safari guest session may not carry over to the installed app.

The service worker displays notifications and opens the matching private chat. Explicit sign-out unsubscribes the current device. OS/browser permissions and Focus settings still control delivery.

Validation: node --test tests/push-notifications.test.cjs; TypeScript and ESLint; live GET configuration, unauthorized POST rejection, SQL RLS/trigger/signing-key checks. Actual lock-screen delivery requires a subscribed user device. pg_net response history should be monitored for transient delivery failures; there is no durable retry queue in this version.
