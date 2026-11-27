import { serviceRead } from '@/lib/service-live';

export async function GET(request: Request, { params }: { params: Promise<{ id: string; index: string }> }) {
  const { id, index } = await params;
  const version = new URL(request.url).searchParams.get('v') ?? '';
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id) || !/^(?:[0-9]|1[0-9]|20)$/.test(index) || !/^[a-f0-9]{32}$/.test(version)) {
    return new Response(null, { status: 404 });
  }
  try {
    const photo = await serviceRead<string | null>(`rpc/esx_public_service_photo?p_id=${id}&p_index=${index}&p_version=${version}`);
    if (!photo || !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo) || photo.length > 200000) return new Response(null, { status: 404 });
    return new Response(Buffer.from(photo.split(',')[1], 'base64'), { headers: {
      'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=30',
    } });
  } catch { return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
