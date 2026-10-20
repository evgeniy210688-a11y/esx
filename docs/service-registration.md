# Company and specialist applications

Visitors open `/services/register` from the directory or their account.
They sign in with a confirmed email, choose company or specialist, and submit
their details. The form supports an optional image and shows application status.

## Review

In `/admin`, select **Статус заявки → На проверке**, open an application and
review its fields. Select **Опубликовано** and save to approve it, or
**В архиве** and save to leave it unpublished. The existing administrator role
(`esx_service_admins`) is the only role allowed to change listings.

Applicants can read their applications, but cannot modify or publish them.
Published cards must also be changed through the administrator, so reviewed
content cannot subsequently be replaced by the applicant.

## Rollout

1. Apply `supabase/migrations/20261020_service_submissions.sql` to the existing
   Supabase database before deploying the UI. It does not publish existing rows.
2. Deploy the application.
3. Submit a test application with a confirmed non-admin account. Verify it is
   visible to that account and the administrator, but not in the public directory.
4. Approve it in `/admin` and verify public visibility. Archive the test entry.

The submission RPC forces `pending`, validates existing database constraints,
assigns ownership from `auth.uid()` and requires a verified non-anonymous user.
It accepts up to five pending/recent applications per account and serializes
submissions for the same user. The request UUID makes retries idempotent.
No service-role secret is exposed to the browser.

## Tests

Install `@electric-sql/pglite` in a temporary directory and set `PGLITE_MODULE`
to its absolute package path, then run:

```sh
node --test tests/service-submissions.test.cjs
```

The test runs the actual migrations in isolated PostgreSQL, with anonymous,
authenticated, guest, unverified, owner, other-user and admin identities.
