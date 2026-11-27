import { getPublishedServices } from '@/lib/service-live';

// Preserve the client cursor contract while sharing the cached live data.
export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get('after');
  if (cursor && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor)) {
    return Response.json({ error: 'Invalid cursor' }, { status: 400 });
  }
  let publishedServices;
  try { publishedServices = await getPublishedServices(); }
  catch { return Response.json({ error: 'Directory temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
  const rows = publishedServices.filter(row => !cursor || row.id > cursor.toLowerCase())
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0).slice(0, 25)
    .map(({ profile_content, ...listing }) => { void profile_content; return listing; });
  return Response.json(rows, { headers: {
    'Cache-Control': 'no-store',
    'X-Total-Count': String(publishedServices.length),
  } });
}
