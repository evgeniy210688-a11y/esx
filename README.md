This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## Chat translation

Set `OPENAI_API_KEY` as a server-only Production environment variable in Vercel.
`POST /api/translate` uses `gpt-5.6-luna` through the Responses API with
`store: false`. It accepts `{ chatId, messageId, target }`, loads the original
message using the existing Supabase publishable key and RLS, and translates
incoming messages into the recipient's selected "Your language". Incoming messages show only the translation. While loading, a status is shown;
if translation fails, a retry button is shown without revealing the original.

Only visible incoming messages are requested. Messages above 4,000 characters
are not translated. A bounded ten-minute per-instance cache and a 30-request
per-minute per-IP limit reduce repeated calls; these are not durable/global
limits across Vercel instances. Configure Vercel Firewall and OpenAI project
budgets for stronger spending controls. Room links remain the existing chat's
access mechanism; this feature does not add authenticated room membership.

Run `node --test tests/translate-route.test.cjs` for mocked route checks.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Visitor analytics

Vercel Web Analytics is mounted once through `app/SiteAnalytics.tsx`, including
client-side navigation. Query strings, fragments, and chat room identifiers
are removed from recorded page URLs.

For `www.88esx.com`, enable **Analytics / Web Analytics** in the site's Vercel
project, then deploy this version. Visit the public site and navigate between
pages; confirm page views appear in the Analytics dashboard. Visits before
activation are not backfilled. Local development uses the SDK's development mode.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Prepared service translations

The directory ships prepared translations for all seven interface languages, so existing listings switch languages without translation API calls. Cache keys include the original description, city and category; edited content cannot reuse a stale translation. New or edited listings fall back to four concurrent requests and a browser cache.

After publishing listing changes, run `node scripts/prepare-service-translations.cjs` with the project's public Supabase environment variables available, then commit the regenerated `lib/service-translations.generated.json` and deploy. The script uses the site's existing translation endpoint, resumes missing entries and retries temporary failures. `SERVICE_TRANSLATION_ORIGIN` optionally selects a different deployment. This is a maintenance command, not part of every build.
