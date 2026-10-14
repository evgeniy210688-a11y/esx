import type { ServiceBranch } from '@/lib/service-directory';

export default function BranchEditor({ branches, onChange }: { branches: ServiceBranch[]; onChange: (branches: ServiceBranch[]) => void }) {
  function change(id: string, field: keyof Omit<ServiceBranch, 'id'>, value: string) {
    onChange(branches.map(branch => branch.id === id ? { ...branch, [field]: value } : branch));
  }
  return <fieldset id="company-branches" className="admin-socials">
    <legend>Филиалы ({branches.length})</legend>
    <p>Добавьте дополнительные адреса компании. Основной адрес указан выше. Изменения филиалов сохраняются вместе с карточкой.</p>
    {branches.map((branch, index) => <fieldset key={branch.id} className="admin-socials admin-form">
      <legend>Филиал {index + 1}</legend>
      <label>Название филиала<input required maxLength={200} value={branch.name} onChange={e => change(branch.id, 'name', e.target.value)} /></label>
      <label>Город филиала<input required maxLength={100} list="service-city-options" value={branch.city} onChange={e => change(branch.id, 'city', e.target.value)} /></label>
      <label>Адрес филиала<input required maxLength={500} value={branch.address} onChange={e => change(branch.id, 'address', e.target.value)} /></label>
      <label>Телефон филиала (необязательно)<input type="tel" maxLength={30} value={branch.phone} onChange={e => change(branch.id, 'phone', e.target.value)} placeholder="+82 10-1234-5678" /></label>
      <button type="button" onClick={() => { if (window.confirm('Убрать этот филиал из карточки? Изменение применится после сохранения.')) onChange(branches.filter(item => item.id !== branch.id)); }}>Убрать филиал {index + 1}</button>
    </fieldset>)}
    <button type="button" onClick={() => onChange([...branches, { id: crypto.randomUUID(), name: '', city: '', address: '', phone: '' }])}>+ Добавить филиал</button>
  </fieldset>;
}
