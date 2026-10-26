import { createClient } from '@supabase/supabase-js';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

export const inviteCookie = 'esx_service_activation';
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const reply = (data: object, status = 200) => Response.json(data, {status, headers: {'Cache-Control':'no-store', Pragma:'no-cache'}});
export function inviteServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = process.env.SERVICE_ACCESS_ENCRYPTION_KEY;
  if (!url || !secret || !key || !/^[0-9a-f]{64}$/i.test(key)) throw Error('NOT_CONFIGURED');
  return {db:createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}),key:Buffer.from(key,'hex')};
}
export function encryptPassword(password: string, listing: string, key: Buffer) {
  const iv=randomBytes(12), cipher=createCipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from(listing));
  const data=Buffer.concat([cipher.update(password,'utf8'),cipher.final()]);
  return [iv,cipher.getAuthTag(),data].map(value=>value.toString('base64')).join('.');
}
export function decryptPassword(value:string,listing:string,key:Buffer) {
  const [iv,tag,data]=value.split('.').map(part=>Buffer.from(part,'base64'));
  const cipher=createDecipheriv('aes-256-gcm',key,iv);
  cipher.setAAD(Buffer.from(listing));cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');
}
export function activationToken(request:Request) {
  const value=request.headers.get('cookie')?.split(';').map(item=>item.trim()).find(item=>item.startsWith(inviteCookie+'='))?.slice(inviteCookie.length+1);
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}
export function setActivationCookie(response:Response,request:Request,token:string,age=86400) {
  response.headers.set('Set-Cookie',`${inviteCookie}=${token}; HttpOnly; SameSite=Strict; Path=/api/service-activation; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`);
  return response;
}
