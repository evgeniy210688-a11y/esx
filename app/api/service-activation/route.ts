import { randomBytes } from 'node:crypto';
import { activationToken,digest,inviteServer,reply,setActivationCookie } from '@/lib/service-invites';
export const runtime='nodejs';
export async function GET(request:Request) {
  try {
    const token=activationToken(request);if(!token)return reply({active:false});
    const {db}=inviteServer();
    const result=await db.from('esx_service_invites').select('listing_id').eq('session_hash',digest(token)).is('claimed_at',null).gt('session_expires_at',new Date().toISOString()).maybeSingle();
    if(result.error)return reply({error:'Активация временно недоступна.'},503);
    if(!result.data)return reply({active:false});
    const listing=await db.from('esx_service_listings').select('name').eq('id',result.data.listing_id).single();
    return reply({active:true,name:listing.data?.name??''});
  }catch{return reply({error:'Активация ещё не настроена на сервере.'},503);}
}
export async function POST(request:Request) {
  try {
    if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Недопустимый источник запроса.'},403);
    const raw=await request.text();if(raw.length>1500)return reply({error:'Слишком большой запрос.'},413);
    const body=JSON.parse(raw),{db}=inviteServer();
    if(body.action==='redeem') {
      const login=typeof body.login==='string'?body.login.trim().toLowerCase():'';
      if(!/^esx_[0-9a-f]{24}$/.test(login)||typeof body.password!=='string'||body.password.length>100)return reply({error:'Неверные или уже использованные временные данные.'},401);
      const token=randomBytes(32).toString('base64url');
      const result=await db.rpc('esx_redeem_service_invite',{p_login:login,p_hash:digest(login+':'+body.password),p_session:digest(token)});
      if(result.error)return reply({error:'Активация временно недоступна.'},503);
      if(!result.data)return reply({error:'Неверные, истёкшие или уже использованные временные данные.'},401);
      const listing=await db.from('esx_service_listings').select('name').eq('id',result.data).maybeSingle();
      return setActivationCookie(reply({active:true,name:listing.data?.name??''}),request,token);
    }
    if(body.action==='claim') {
      const token=activationToken(request),bearer=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
      if(!token||!bearer)return reply({error:'Войдите и подтвердите свою почту.'},401);
      const {data:{user},error}=await db.auth.getUser(bearer);
      if(error||!user||user.is_anonymous||!user.email_confirmed_at)return reply({error:'Подтвердите свою почту.'},401);
      const result=await db.rpc('esx_claim_service_invite',{p_session:digest(token),p_user:user.id});
      if(result.error)return reply({error:'Не удалось завершить активацию. Временный доступ мог истечь или быть заменён администратором.'},409);
      return setActivationCookie(reply({complete:true}),request,'',0);
    }
    return reply({error:'Неизвестное действие.'},400);
  }catch{return reply({error:'Активация ещё не настроена на сервере.'},503);}
}
