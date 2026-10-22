export type ProfileButton = { id: string; label: string; text: string; children: ProfileButton[] };
export type ProfileBlock = { id: string; title: string; buttons: ProfileButton[] };
export type ProfileContent = { version: 1; blocks: ProfileBlock[] };
export const ALINA_ID = '7dab9a53-66c5-409c-ab50-9f6a5c8b48cf';
export const MAX_DEPTH = 5;
export function contentError(value: unknown): string | null {
  if (!value || typeof value !== 'object') return 'Некорректные данные страницы.';
  const content = value as ProfileContent;
  if (content.version !== 1 || !Array.isArray(content.blocks) || content.blocks.length > 20) return 'Допустимо до 20 блоков.';
  const ids = new Set<string>();
  let count = 0;
  function validId(id: unknown) {
    if (typeof id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(id) || ids.has(id)) return false;
    ids.add(id); return true;
  }
  function validButtons(buttons: ProfileButton[], depth: number): boolean {
    if (!Array.isArray(buttons) || (buttons.length > 0 && depth > MAX_DEPTH)) return false;
    return buttons.every(button => !!button && ++count <= 100 && validId(button.id) &&
      typeof button.label === 'string' && !!button.label.trim() && button.label.length <= 100 &&
      typeof button.text === 'string' && button.text.length <= 10000 && validButtons(button.children, depth + 1));
  }
  if (!content.blocks.every(block => !!block && validId(block.id) && typeof block.title === 'string' && block.title.length <= 100 && validButtons(block.buttons, 1))) return 'Проверьте названия кнопок. Лимит: 100 кнопок, 5 уровней вложенности, 10 000 знаков текста на кнопку.';
  if (new TextEncoder().encode(JSON.stringify(content)).length > 200000) return 'Слишком большой объём страницы.';
  return null;
}
const button = (id: string, label: string, text = '', children: ProfileButton[] = []): ProfileButton => ({ id, label, text, children });
export const defaultProfileContent: ProfileContent = { version: 1, blocks: [{ id: 'documents', title: '', buttons: [
  button('id-card', 'Айди карта', '', [button('id-apply', 'Подать на айди карту'), button('id-restore', 'Восстановить айди карту'), button('id-replace', 'Поменять айди карту'), button('id-child', 'Айди карта ребёнку')]),
  button('visa-renew', 'Продление визы'),
  button('visa-change', 'Смена визы', `Смена визы с H2 на F4

Необходимые документы
• Справка о 3- или 5-часовой учёбе
• Айди с двух сторон
• Паспорт
• Новое фото
• Свидетельство о рождении
• Договор аренды жилья (+ айди квартиросъёмщика)

Стоимость
• Госпошлина — 39 000 (наличными)
• Работа юриста — 100 000
• Новое фото — 10 000
• Поиск учёбы — 10 000
• 1 перевод — 30 000

Сроки
Ориентировочно 1–3 месяца.`),
  button('address-change', 'Смена адреса'), button('apostille', 'Апостиль'),
] }] };
