import { publishedServices } from '@/lib/service-snapshot';

// Serve the complete published export without a database request.
export async function GET(request: Request) {
  const cursor = new URL(request.url).searchParams.get('after');
  if (cursor && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor)) {
    return Response.json({ error: 'Invalid cursor' }, { status: 400 });
  }
  const rows = publishedServices.filter(row => !cursor || row.id > cursor.toLowerCase()).slice(0, 25)
    .map(({ profile_content, ...listing }) => { void profile_content; return listing; });
  return Response.json(rows, { headers: {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=60',
    'X-Total-Count': String(publishedServices.length),
  } });
}
