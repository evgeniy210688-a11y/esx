export const socialNetworks = { telegram: 'Telegram', instagram: 'Instagram', facebook: 'Facebook', vk: 'ВКонтакте', youtube: 'YouTube', tiktok: 'TikTok', kakao: 'KakaoTalk', whatsapp: 'WhatsApp', wechat: 'WeChat', naver: 'Naver', x: 'X / Twitter', other: 'Другая соцсеть' } as const;
export type SocialLink = { network: keyof typeof socialNetworks; url: string };
export function validSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is SocialLink => {
    if (!item || typeof item !== 'object' || typeof item.network !== 'string' || !Object.hasOwn(socialNetworks, item.network) || typeof item.url !== 'string') return false;
    try { const u = new URL(item.url); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
  }).slice(0, 12);
}
