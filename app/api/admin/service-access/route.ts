import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { digest, encryptPassword, decryptPassword } from '@/lib/service-invites';
export const runtime = 'nodejs';
const reply = (data: object,status=200) => Response.json(data,{status,headers:{'Cache-Control':'no-store','Pragma':'no-cache'}});
async function authorize(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return {error:reply({error:'Войдите в аккаунт администратора.'},401)};
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const client = createClient(url,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const {data:{user},error} = await client.auth.getUser(token);
  if (error || !user || user.is_anonymous) return {error:reply({error:'Войдите в аккаунт администратора.'},401)};
  const admin = await client.from('esx_service_admins').select('user_id').eq('user_id',user.id).maybeSingle();
  if (admin.error || !admin.data) return {error:reply({error:'Нет доступа администратора.'},403)};
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const encryption = process.env.SERVICE_ACCESS_ENCRYPTION_KEY;
  if (!secret || !encryption || !/^[0-9a-f]{64}$/i.test(encryption)) return {error:reply({error:'Выдача доступа ещё не подключена: требуется настройка сервера.'},503)};
  return {user,db:createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),key:Buffer.from(encryption,'hex')};
}
export async function GET(request: Request) {
  try {
    const auth=await authorize(request);if(auth.error)return auth.error;
    const id=new URL(request.url).searchParams.get('listing');
    if(!id||!/^[0-9a-f-]{36}$/i.test(id))return reply({error:'Выберите карточку.'},400);
    const owners=await auth.db!.from('esx_service_owners').select('user_id').eq('listing_id',id).limit(1);
    if(owners.error)return reply({error:'Не удалось проверить владельца.'},503);
    if(owners.data?.length)return reply({credentials:null,hasOwner:true});
    const result=await auth.db!.from('esx_service_invites').select('login,password_encrypted,consumed_at,expires_at').eq('listing_id',id).maybeSingle();
    if(result.error)return reply({error:'Одноразовый доступ ещё не подключён: требуется обновление базы данных.'},503);
    const item=result.data;
    if(!item)return reply({credentials:null,hasOwner:false});
    if(item.consumed_at||Date.parse(item.expires_at)<=Date.now())return reply({credentials:null,hasOwner:false,used:!!item.consumed_at,expired:!item.consumed_at});
    return reply({credentials:{login:item.login,password:decryptPassword(item.password_encrypted,id,auth.key!),expiresAt:item.expires_at}});
  }catch{return reply({error:'Не удалось загрузить доступ.'},500);}
}
export async function POST(request:Request) {
  try{
    if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Недопустимый источник запроса.'},403);
    const auth=await authorize(request);if(auth.error)return auth.error;
    const raw=await request.text();if(raw.length>1000)return reply({error:'Слишком большой запрос.'},413);
    const body=JSON.parse(raw);
    if(typeof body.listing!=='string'||!/^[0-9a-f-]{36}$/i.test(body.listing))return reply({error:'Выберите сохранённую карточку.'},400);
    const login='esx_'+randomBytes(12).toString('hex'),password=randomBytes(18).toString('base64url');
    const result=await auth.db!.rpc('esx_issue_service_invite',{p_listing:body.listing,p_login:login,p_hash:digest(login+':'+password),p_encrypted:encryptPassword(password,body.listing,auth.key!),p_admin:auth.user!.id});
    if(result.error)return reply({error:'Не удалось выдать доступ. Проверьте настройку базы и отсутствие владельца у карточки.'},409);
    return reply({credentials:{login,password,expiresAt:new Date(Date.now()+7*86400000).toISOString()}});
  }catch{return reply({error:'Не удалось создать доступ.'},500);}
}
