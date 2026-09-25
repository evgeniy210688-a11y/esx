# Contact email

The contact form uses POST /api/contact and Resend. It never opens a mail client.
Set server-only RESEND_API_KEY and CONTACT_FROM_EMAIL in the hosting environment
and .env.local for local testing. CONTACT_FROM_EMAIL must be an allowed Resend
sender on a verified domain (the existing registration sender can be reused).
Do not put secrets in NEXT_PUBLIC variables or source control. Redeploy after
configuring hosting variables. Recipient is fixed to 88esx88@gmail.com; Reply-To
is the visitor's validated address.

Without configuration the form reports unavailability and preserves the draft;
it never claims a successful send. Provider acceptance is not proof of inbox delivery.
Retries retain an idempotency key until the visitor edits the message. Inputs
are bounded, cross-origin requests rejected, and attempts throttled per instance.
For distributed/global abuse limits configure hosting firewall rules.

Run node --test tests/contact-route.test.cjs for mocked delivery and failure checks.
After deployment verify delivery to the destination inbox with an authorized test.
