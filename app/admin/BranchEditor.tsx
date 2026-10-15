import { useState } from 'react';
import type { ServiceBranch } from '@/lib/service-directory';
import { parseBranchImport } from '@/lib/service-branch-import';

export default function BranchEditor({ branches, onChange }: { branches: ServiceBranch[]; onChange: (branches: ServiceBranch[]) => void }) {
  const [bulk, setBulk] = useState('');
  const [message, setMessage] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const preview = parseBranchImport(bulk, branches);
  function change(id: string, field: keyof Omit<ServiceBranch, 'id'>, value: string) {
    onChange(branches.map(branch => branch.id === id ? { ...branch, [field]: value } : branch));
  }
  return <fieldset id="company-branches" className="admin-socials">
    <legend>Филиалы ({branches.length})</legend>
    <p>Одна карточка для всей сети: описание, услуги и соцсети общие. Основной магазин укажите в адресе компании выше, остальные — здесь. Для сети из 19 магазинов добавьте 18 дополнительных адресов.</p>
    <details className="admin-branch-bulk"><summary>Добавить филиалы списком / из Excel</summary>
      <p>Одна строка — один филиал. Порядок столбцов: название, город, адрес, телефон (необязательно). Скопируйте 3–4 столбца из Excel или разделите значения символом |. Вставляйте без строки заголовков.</p>
      <label>Список филиалов<textarea rows={7} value={bulk} onChange={e => { setBulk(e.target.value); setMessage(''); }} placeholder="Радуга — название филиала | Город | Адрес | Телефон" /></label>
      {bulk.trim() && <><p>Будет добавлено: {preview.rows.length}. Повторяющихся адресов пропущено: {preview.duplicates}.</p>{preview.errors.length > 0 && <ul role="alert">{preview.errors.map(error => <li key={error}>{error}</li>)}</ul>}
      {preview.rows.length > 0 && <div className="admin-branch-preview"><table><thead><tr><th>Название</th><th>Город</th><th>Адрес</th><th>Телефон</th></tr></thead><tbody>{preview.rows.map((row, i) => <tr key={i}><td>{row.name}</td><td>{row.city}</td><td>{row.address}</td><td>{row.phone || '—'}</td></tr>)}</tbody></table></div>}</>}
      <button type="button" disabled={!preview.rows.length || !!preview.errors.length} onClick={() => { const added = preview.rows.map(row => ({ ...row, id: crypto.randomUUID() })); onChange([...branches, ...added]); setBulk(''); setMessage(`Добавлено филиалов: ${added.length}. Нажмите «Сохранить карточку».`); }}>Добавить проверенные филиалы</button>
      <p role="status">{message}</p>
    </details>
    <p>Изменения применятся после нажатия «Сохранить карточку».</p>
    {branches.map((branch, index) => <details key={branch.id} open={openId === branch.id} className="admin-branch-item" onInvalidCapture={e => { e.currentTarget.open = true; setOpenId(branch.id); }}>
      <summary>{index + 1}. {branch.name || 'Новый филиал'}{branch.city ? ` · ${branch.city}` : ''}</summary>
      <div className="admin-form">
      <label>Название филиала<input required maxLength={200} value={branch.name} onChange={e => change(branch.id, 'name', e.target.value)} /></label>
      <label>Город филиала<input required maxLength={100} list="service-city-options" value={branch.city} onChange={e => change(branch.id, 'city', e.target.value)} /></label>
      <label>Адрес филиала<input required maxLength={500} value={branch.address} onChange={e => change(branch.id, 'address', e.target.value)} /></label>
      <label>Телефон филиала (необязательно)<input type="tel" maxLength={30} value={branch.phone} onChange={e => change(branch.id, 'phone', e.target.value)} placeholder="+82 10-1234-5678" /></label>
      <button type="button" onClick={() => { if (window.confirm('Убрать этот филиал из карточки? Изменение применится после сохранения.')) onChange(branches.filter(item => item.id !== branch.id)); }}>Убрать филиал {index + 1}</button>
      </div>
    </details>)}
    <button type="button" onClick={() => { const id = crypto.randomUUID(); onChange([...branches, { id, name: '', city: '', address: '', phone: '' }]); setOpenId(id); }}>+ Добавить филиал вручную</button>
  </fieldset>;
}
