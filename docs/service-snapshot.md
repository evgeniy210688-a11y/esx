# Published service snapshot

The public directory and profile/translation readers use a published-only export
while Supabase is blocked by its egress quota. The export contains 216 unique
listings, captured in three ordered batches on November 12–13, 2026 (Korea time).
Only the fields already used by public pages were exported. No accounts, owner
records, messages, draft listings, or authentication data are included.

Embedded images were decoded without re-encoding into 177 content-addressed files
under public/service-snapshot. Text, contacts and profile content are preserved.
The directory API retains its 25-row cursor contract and total-count header.

During snapshot mode database edits do not automatically change public pages.
To refresh, export the same public fields with status = 'published', validate
unique IDs and the total count, replace lib/service-listings.snapshot.json and
its images, test and deploy. Remove withdrawn listings from the export promptly.
To restore live reads, revert the snapshot reader change after database service
is restored. Login, chat, submissions and admin writes still require Supabase.
