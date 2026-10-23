'use client';

import { useEffect, useState } from 'react';
import useAccount from '@/app/account/useAccount';
import { supabase } from '@/lib/supabase';
import { ALINA_ID, MAX_DEPTH, contentError, defaultProfileContent, type ProfileButton, type ProfileBlock, type ProfileContent } from '@/lib/specialist-content';
import useDismissOutside from './useDismissOutside';
import useRevealPanel from './useRevealPanel';
import { useProfileLanguage } from './ProfileLanguage';
import { useRouter } from 'next/navigation';

function newButton(): ProfileButton { return { id: crypto.randomUUID(), label: 'Новая кнопка', text: '', children: [] }; }

function ButtonLevel({ buttons, path, setPath, level = 1, editing, change }: {
  buttons: ProfileButton[]; path: string[]; setPath: (path: string[]) => void; level?: number;
  editing: boolean; change: (buttons: ProfileButton[]) => void;
}) {
  const {t} = useProfileLanguage();
  function update(id: string, values: Partial<ProfileButton>) { change(buttons.map(button => button.id === id ? { ...button, ...values } : button)); }
  return <>
    <div className="specialist-topic-buttons profile-builder-buttons" role="group" aria-label={t(level === 1 ? 'Выберите тему' : 'Вложенные кнопки')}>
      {buttons.map(button => <button type="button" key={button.id} id={`topic-button-${button.id}`}
        aria-expanded={path[0] === button.id} aria-controls={`topic-panel-${button.id}`} aria-pressed={path[0] === button.id}
        onClick={() => setPath(path[0] === button.id ? [] : [button.id])}>{editing ? button.label || 'Без названия' : t(button.label || 'Без названия')}</button>)}
      {editing && <button type="button" className="profile-add" aria-label={level === 1 ? 'Добавить кнопку' : 'Добавить вложенную кнопку'}
        onClick={() => { const button = newButton(); change([...buttons, button]); setPath([button.id]); }}>+ Кнопка</button>}
    </div>
    {buttons.map(button => <div key={button.id} className="visa-change-panel profile-builder-panel" data-open={path[0] === button.id}
      data-fast={button.id === 'id-card'} id={`topic-panel-${button.id}`} role="region" aria-labelledby={`topic-button-${button.id}`}
      aria-hidden={path[0] !== button.id} inert={path[0] !== button.id}>
      <div className="visa-change-inner"><div className="visa-change-content">
        {editing ? <div className="profile-node-editor">
          <label>Название кнопки<input value={button.label} maxLength={100} onChange={e => update(button.id, { label: e.target.value })} /></label>
          <label>Текст внутри кнопки<textarea rows={8} maxLength={10000} value={button.text} placeholder="Добавьте описание, список документов или другую информацию…" onChange={e => update(button.id, { text: e.target.value })} /></label>
          <button type="button" className="profile-remove" onClick={() => {
            if (!window.confirm(`Удалить «${button.label}» вместе с текстом и вложенными кнопками? Изменение применится после сохранения.`)) return;
            change(buttons.filter(item => item.id !== button.id)); setPath([]);
          }}>Удалить кнопку</button>
        </div> : button.text && <div className="profile-button-text">{t(button.text)}</div>}
        {(button.children.length > 0 || (editing && level < MAX_DEPTH)) && <ButtonLevel buttons={button.children} path={path.slice(1)}
          setPath={next => setPath([button.id, ...next])} level={level + 1} editing={editing} change={children => update(button.id, { children })} />}
      </div></div>
    </div>)}
  </>;
}

export default function ServiceTopics({ initialContent }: { initialContent: ProfileContent | null }) {
  const {t} = useProfileLanguage();
  const router = useRouter();
  const { user } = useAccount();
  const userId = user && !user.is_anonymous ? user.id : null;
  const [allowedId, setAllowedId] = useState<string | null>(null);
  const validInitial = initialContent === null || !contentError(initialContent);
  const [saved, setSaved] = useState<ProfileContent | null>(initialContent);
  const [draft, setDraft] = useState<ProfileContent>(validInitial ? initialContent ?? defaultProfileContent : defaultProfileContent);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [path, setPath] = useState<string[]>([]);
  useRevealPanel(path.length > 1 ? `topic-panel-${path[path.length - 1]}` : null);
  const isAdmin = !!userId && allowedId === userId;
  const canEdit = editing && isAdmin;
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved ?? defaultProfileContent);
  const sectionRef = useDismissOutside<HTMLDivElement>(() => { if (!canEdit) setPath([]); });
  useEffect(() => {
    let active = true;
    setAllowedId(null);
    setEditing(false);
    if (userId) void supabase.from('esx_service_admins').select('user_id').eq('user_id', userId).maybeSingle().then(({ data, error }) => {
      if (active && data && !error) setAllowedId(userId);
    });
    return () => { active = false; };
  }, [userId]);
  useEffect(() => {
    if (!canEdit || !dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [canEdit, dirty]);
  const content = canEdit ? draft : saved ?? defaultProfileContent;
  function changeBlock(id: string, values: Partial<ProfileBlock>) {
    setDraft(current => ({ ...current, blocks: current.blocks.map(block => block.id === id ? { ...block, ...values } : block) }));
  }
  function start() { setDraft(saved ?? defaultProfileContent); setEditing(true); setMessage(''); }
  function addBlock() {
    const button = newButton();
    const block: ProfileBlock = { id: crypto.randomUUID(), title: '', buttons: [button] };
    setDraft(current => ({ version: 1, blocks: [...(canEdit ? current : saved ?? defaultProfileContent).blocks, block] }));
    setEditing(true); setPath([block.id, button.id]); setMessage('');
  }
  async function save() {
    if (!isAdmin || busy) return;
    const errorMessage = contentError(draft);
    if (errorMessage) { setMessage(errorMessage); return; }
    setBusy(true); setMessage('Сохраняем…');
    try {
      let query = supabase.from('esx_service_listings').update({ profile_content: draft }).eq('id', ALINA_ID);
      query = saved === null ? query.is('profile_content', null) : query.eq('profile_content', JSON.stringify(saved));
      const { data, error } = await query.select('profile_content').maybeSingle();
      if (error) throw error;
      if (!data) { setMessage('Страница уже изменена в другом окне или права доступа изменились. Скопируйте нужный текст и обновите страницу. Ваш черновик здесь сохранён.'); return; }
      setSaved(data.profile_content); setDraft(data.profile_content); setEditing(false); setMessage('Сохранено. Изменения видны всем посетителям.'); router.refresh();
    } catch { setMessage('Не удалось сохранить. Проверьте подключение и права администратора, затем повторите. Черновик не потерян.'); }
    finally { setBusy(false); }
  }
  if (!validInitial) return <p role="alert">Не удалось прочитать блоки страницы. Обновите страницу или обратитесь к администратору.</p>;
  return <div ref={sectionRef} className="profile-builder">
    {isAdmin && <div className="profile-editor-toolbar">
      {canEdit ? <><strong>Редактирование блоков</strong><button type="button" disabled={busy} onClick={save}>{busy ? 'Сохраняем…' : 'Сохранить'}</button>
        <button type="button" disabled={busy} onClick={() => {
          if (dirty && !window.confirm('Отменить несохранённые изменения?')) return;
          setDraft(saved ?? defaultProfileContent); setEditing(false); setPath([]); setMessage('');
        }}>Отмена</button></> : <button type="button" onClick={start}>Редактировать блоки</button>}
      <button type="button" className="profile-add" disabled={busy || content.blocks.length >= 20} onClick={addBlock} aria-label="Добавить блок и кнопку">+ Добавить блок</button>
    </div>}
    {message && isAdmin && <p role="status" className="profile-editor-message">{message}</p>}
    <fieldset className="profile-builder-fieldset" disabled={busy}>
      {content.blocks.map(block => <section key={block.id} className="services-card specialist-topics" aria-label={t(block.title || 'Вопросы по документам')}>
        {canEdit ? <div className="profile-block-editor"><label>Название блока (необязательно)<input maxLength={100} value={block.title} onChange={e => changeBlock(block.id, { title: e.target.value })} /></label>
          <button type="button" className="profile-remove" onClick={() => {
            if (!window.confirm('Удалить этот блок со всеми кнопками и текстом? Изменение применится после сохранения.')) return;
            setDraft(current => ({ ...current, blocks: current.blocks.filter(item => item.id !== block.id) })); setPath([]);
          }}>Удалить блок</button></div> : block.title && <h2>{t(block.title)}</h2>}
        <ButtonLevel buttons={block.buttons} path={path[0] === block.id ? path.slice(1) : []} setPath={next => setPath([block.id, ...next])}
          editing={canEdit} change={buttons => changeBlock(block.id, { buttons })} />
      </section>)}
    </fieldset>
  </div>;
}
