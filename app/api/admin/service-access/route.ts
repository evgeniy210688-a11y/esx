import { createClient } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
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
    const auth = await authorize(request); if (auth.error) return auth.error;
    const id = new URL(request.url).searchParams.get('listing');
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return reply({error:'Выберите карточку.'},400);
    const result = await auth.db!.from('esx_service_access').select('email,password_encrypted').eq('listing_id',id).maybeSingle();
    if (result.error) return reply({error:'Хранилище доступа ещё не настроено.'},503);
    if (!result.data) {
      const owners = await auth.db!.from('esx_service_owners').select('user_id').eq('listing_id',id).limit(1);
      if (owners.error) return reply({error:'Не удалось проверить владельца.'},503);
      return reply({credentials:null,hasOwner:!!owners.data?.length});
    }
    const [iv,tag,ciphertext] = result.data.password_encrypted.split('.').map((value:string)=>Buffer.from(value,'base64'));
    const decipher = createDecipheriv('aes-256-gcm',auth.key!,iv); decipher.setAuthTag(tag); decipher.setAAD(Buffer.from(id));
    const password = Buffer.concat([decipher.update(ciphertext),decipher.final()]).toString('utf8');
    return reply({credentials:{email:result.data.email,login:result.data.email,password}});
  } catch { return reply({error:'Не удалось загрузить доступ.'},500); }
}
export async function POST(request: Request) {
  try {
    if (request.headers.get('origin') !== new URL(request.url).origin) return reply({error:'Недопустимый источник запроса.'},403);
    const auth = await authorize(request); if (auth.error) return auth.error;
    const raw = await request.text(); if(raw.length>1000) return reply({error:'Слишком большой запрос.'},413);
    const body = JSON.parse(raw);
    if(typeof body.listing!=='string'||!/^[0-9a-f-]{36}$/i.test(body.listing)||typeof body.email!=='string'||body.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return reply({error:'Укажите корректную почту и сохранённую карточку.'},400);
    const db=auth.db!;
    const existing=await db.from('esx_service_access').select('listing_id').eq('listing_id',body.listing).maybeSingle();
    if(existing.error) return reply({error:'Хранилище доступа ещё не настроено.'},503);
    const owners=await db.from('esx_service_owners').select('user_id').eq('listing_id',body.listing).limit(1);
    if(owners.error) return reply({error:'Не удалось проверить владельца.'},503);
    if(existing.data || owners.data?.length) return reply({error:'У карточки уже есть владелец. Существующий пароль не изменён.'},409);
    const listing=await db.from('esx_service_listings').select('id').eq('id',body.listing).maybeSingle();
    if(listing.error||!listing.data) return reply({error:'Карточка не найдена.'},404);
    const email=body.email.trim().toLowerCase();
    const password='Esx!'+randomBytes(18).toString('base64url');
    const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',auth.key!,iv);
    cipher.setAAD(Buffer.from(body.listing));
    const encrypted=Buffer.concat([cipher.update(password,'utf8'),cipher.final()]);
    const stored=[iv,cipher.getAuthTag(),encrypted].map(value=>value.toString('base64')).join('.');
    const created=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{username:'esx_'+randomBytes(8).toString('hex'),language:'ru'}});
    if(created.error||!created.data.user) return reply({error:'Не удалось создать доступ. Возможно, эта почта уже зарегистрирована. Существующий аккаунт не изменён.'},409);
    const saved=await db.rpc('esx_attach_generated_access',{p_listing:body.listing,p_user:created.data.user.id,p_email:email,p_password:stored,p_admin:auth.user!.id});
    if(saved.error) { await db.auth.admin.deleteUser(created.data.user.id); return reply({error:'Не удалось привязать доступ к карточке. Обновите панель и повторите.'},409); }
    return reply({credentials:{email,login:email,password}});
  } catch { return reply({error:'Не удалось создать доступ.'},500); }
}
