import type { Language } from '@/app/design/content';
import { foxStickers, type FoxSticker } from './fox-stickers';

export const foxStickerLabels: Record<Language, string[]> = {
  ru: ['Смайлики с лисёнком', 'Нажмите, чтобы отправить', 'Привет', 'Сердечко', 'Сплю', 'Скучаю', 'Устал', "Грусть", "Радость", "Злость", "Тоска", "Испуг", "Удивление", 'Поздравляю', "Спасибо", "Просьба", 'Обнимашки', "Договорились", "Голодный", "Обещаю", "Занят", "Болею", "Думаю", "Стресс"],
  en: ['Fox stickers', 'Tap to send', 'Hello', 'Love', 'Sleeping', 'Miss you', 'Tired', "Sadness", "Joy", "Anger", "Longing", "Fear", "Surprise", 'Congratulations', "Thank you", "Please", 'Hugs', "Deal", "Hungry", "I promise", "Busy", "Feeling sick", "Thinking", "Stressed"],
  ko: ['여우 스티커', '눌러서 보내기', '안녕', '사랑', '자는 중', '보고 싶어', '피곤해', "슬픔", "기쁨", "화남", "그리움", "무서움", "놀람", '축하해요', "고마워요", "부탁해요", '포옹', "좋아요", "배고파요", "약속해요", "바빠요", "아파요", "생각 중", "스트레스"],
  zh: ['狐狸贴纸', '点击发送', '你好', '爱心', '睡觉', '想你了', '累了', "悲伤", "开心", "生气", "思念", "害怕", "惊讶", '恭喜', "谢谢", "拜托", '抱抱', "说定了", "饿了", "我保证", "忙碌中", "生病了", "思考中", "压力大"],
  tr: ['Tilki çıkartmaları', 'Göndermek için dokun', 'Merhaba', 'Sevgi', 'Uyuyorum', 'Özledim', 'Yorgunum', "Üzüntü", "Sevinç", "Öfke", "Hasret", "Korku", "Şaşkınlık", 'Tebrikler', "Teşekkürler", "Lütfen", 'Sarılma', "Anlaştık", "Açım", "Söz veriyorum", "Meşgulüm", "Hastayım", "Düşünüyorum", "Stresli"],
  vi: ['Nhãn dán cáo', 'Nhấn để gửi', 'Xin chào', 'Yêu thương', 'Đang ngủ', 'Nhớ bạn', 'Mệt', "Buồn", "Vui", "Giận", "Nhung nhớ", "Sợ hãi", "Ngạc nhiên", 'Chúc mừng', "Cảm ơn", "Làm ơn", 'Ôm nào', "Đồng ý", "Đói bụng", "Tôi hứa", "Đang bận", "Bị ốm", "Đang suy nghĩ", "Căng thẳng"],
  km: ['ស្ទីគ័រកញ្ជ្រោង', 'ចុចដើម្បីផ្ញើ', 'សួស្តី', 'ស្រឡាញ់', 'កំពុងគេង', 'នឹកអ្នក', 'ហត់', "សោកសៅ", "រីករាយ", "ខឹង", "អាឡោះអាល័យ", "ភ័យខ្លាច", "ភ្ញាក់ផ្អើល", 'អបអរសាទរ', "អរគុណ", "សូមមេត្តា", 'ឱប', "យល់ព្រម", "ឃ្លាន", "ខ្ញុំសន្យា", "រវល់", "ឈឺ", "កំពុងគិត", "តានតឹង"],
  kk: ['Түлкі стикерлері', 'Жіберу үшін басыңыз', 'Сәлем', 'Махаббат', 'Ұйықтап жатырмын', 'Сағындым', 'Шаршадым', "Мұң", "Қуаныш", "Ашу", "Сағыныш", "Қорқыныш", "Таңғалу", 'Құттықтаймын', "Рақмет", "Өтінемін", 'Құшақтау', "Келістік", "Қарным ашты", "Уәде беремін", "Қолым бос емес", "Ауырып қалдым", "Ойланып отырмын", "Күйзеліс"],
};

const aliases: Partial<Record<FoxSticker, string[]>> = {
  sick: ['болен', 'болею', 'заболел', 'заболела', 'sick', 'ill'],
  stress: ['стрес', 'стресс', 'stress'],
  hungry: ['голоден', 'голодна', 'голодная', 'хочу есть'],
  busy: ['занята'], tired: ['устала'], sad: ['грустно'], joy: ['рад', 'рада'],
  anger: ['злюсь'], fear: ['боюсь'], surprise: ['удивлен', 'удивлена'],
  heart: ['люблю'], sleep: ['хочу спать'], hugs: ['обнимаю'],
};
function normalize(text: string) {
  return text.normalize('NFKC').toLowerCase().replace(/ё/g, 'е')
    .replace(/[.!?,…。！？]+$/u, '').trim().replace(/\s+/g, ' ');
}
export function suggestFoxStickers(text: string): FoxSticker[] {
  const query = normalize(text.trim());
  if (!query || query.length > 80) return [];
  return foxStickers.filter((id, index) =>
    Object.values(foxStickerLabels).some(row => normalize(row[index + 2]) === query)
    || aliases[id]?.some(alias => normalize(alias) === query));
}
