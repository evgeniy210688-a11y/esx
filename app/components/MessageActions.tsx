'use client';

import { useRef, useState, type ReactNode } from 'react';
import type { Language } from '@/app/design/content';
import { changeMessage } from '@/lib/message-actions';
import './message-actions.css';

const labels: Record<Language, string[]> = {
  ru: ['Действия с сообщением', 'Изменить', 'Удалить', 'Копировать', 'Сохранить', 'Отмена', 'Удалить сообщение у всех?', 'Скопировано', 'Не удалось выполнить действие. Попробуйте ещё раз.', 'Текст сообщения'],
  en: ['Message actions', 'Edit', 'Delete', 'Copy', 'Save', 'Cancel', 'Delete this message for everyone?', 'Copied', 'Unable to complete the action. Please try again.', 'Message text'],
  ko: ['메시지 작업', '수정', '삭제', '복사', '저장', '취소', '모두에게서 이 메시지를 삭제할까요?', '복사됨', '작업을 완료하지 못했습니다. 다시 시도해 주세요.', '메시지 내용'],
  zh: ['消息操作', '编辑', '删除', '复制', '保存', '取消', '为所有人删除此消息？', '已复制', '操作失败，请重试。', '消息内容'],
  tr: ['Mesaj işlemleri', 'Düzenle', 'Sil', 'Kopyala', 'Kaydet', 'İptal', 'Bu mesaj herkesten silinsin mi?', 'Kopyalandı', 'İşlem tamamlanamadı. Tekrar deneyin.', 'Mesaj metni'],
  vi: ['Thao tác tin nhắn', 'Chỉnh sửa', 'Xóa', 'Sao chép', 'Lưu', 'Hủy', 'Xóa tin nhắn này với mọi người?', 'Đã sao chép', 'Không thể hoàn tất. Vui lòng thử lại.', 'Nội dung tin nhắn'],
  km: ['សកម្មភាពសារ', 'កែសម្រួល', 'លុប', 'ចម្លង', 'រក្សាទុក', 'បោះបង់', 'លុបសារនេះសម្រាប់អ្នកទាំងអស់គ្នា?', 'បានចម្លង', 'មិនអាចបញ្ចប់សកម្មភាពបានទេ។ សូមព្យាយាមម្តងទៀត។', 'អត្ថបទសារ'],
  kk: ['Хабарлама әрекеттері', 'Өзгерту', 'Жою', 'Көшіру', 'Сақтау', 'Бас тарту', 'Хабарламаны барлығы үшін жою керек пе?', 'Көшірілді', 'Әрекет орындалмады. Қайталап көріңіз.', 'Хабарлама мәтіні'],
};

export default function MessageActions({ children, chatId, messageId, message, own, sticker = false, privateChat = false, language, onChange }: {
  children: ReactNode; chatId: string; messageId: string | number; message: string; own: boolean;
  sticker?: boolean; privateChat?: boolean; language: Language; onChange: (replacement: string | null) => void;
}) {
  const content = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const lock = useRef(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState(message);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<'copied' | 'error' | ''>('');
  const t = labels[language];
  function closeMenu() { if (menu.current) menu.current.open = false; setFeedback(''); }
  async function copy() {
    closeMenu();
    // Copy the text the recipient sees, never the loading/error label or hidden original.
    const value = own ? message : content.current?.querySelector<HTMLElement>('[data-message-text]')?.innerText;
    if (!value) { setFeedback('error'); return; }
    try { await navigator.clipboard.writeText(value); setFeedback('copied'); }
    catch { setFeedback('error'); }
  }
  async function mutate(operation: 'edit' | 'delete') {
    if (!own || lock.current || (operation === 'edit' && (sticker || !draft.trim() || draft.length > 4000))) return;
    lock.current = true; setBusy(true); setFeedback('');
    try {
      const replacement = operation === 'edit' ? draft.trim() : undefined;
      await changeMessage(chatId, messageId, operation, privateChat, replacement);
      onChange(replacement ?? null); setEditing(false); setDeleting(false);
    } catch { setFeedback('error'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="message-actions-wrap">
    <div ref={content}>{children}</div>
    {(!sticker || own) && !editing && !deleting && <details ref={menu} className="message-actions-menu" onKeyDown={event => { if (event.key === 'Escape') closeMenu(); }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeMenu(); }}>
      <summary aria-label={t[0]} title={t[0]}>⋯</summary>
      <div className="message-actions-options">
        {!sticker && <button type="button" onClick={() => void copy()}>{t[3]}</button>}
        {own && !sticker && <button type="button" onClick={() => { closeMenu(); setDraft(message); setEditing(true); }}>{t[1]}</button>}
        {own && <button type="button" onClick={() => { closeMenu(); setDeleting(true); }}>{t[2]}</button>}
      </div>
    </details>}
    {editing && <form className="message-edit" onSubmit={event => { event.preventDefault(); void mutate('edit'); }}>
      <textarea aria-label={t[9]} value={draft} onChange={event => setDraft(event.target.value)} maxLength={4000} rows={3} autoFocus disabled={busy} onKeyDown={event => { if (event.key === 'Escape' && !busy) { setEditing(false); setFeedback(''); } }} />
      <div><button type="submit" disabled={busy || !draft.trim() || draft.trim() === message}>{t[4]}</button><button type="button" disabled={busy} onClick={() => { setEditing(false); setFeedback(''); }}>{t[5]}</button></div>
    </form>}
    {deleting && <div className="message-edit" role="group" aria-label={t[6]}><p>{t[6]}</p><div><button type="button" disabled={busy} onClick={() => void mutate('delete')}>{t[2]}</button><button type="button" disabled={busy} onClick={() => { setDeleting(false); setFeedback(''); }}>{t[5]}</button></div></div>}
    {feedback && <small className="message-action-feedback" role={feedback === 'error' ? 'alert' : 'status'}>{t[feedback === 'copied' ? 7 : 8]}</small>}
  </div>;
}
