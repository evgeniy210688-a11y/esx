import { normalizeServiceCity, validServiceBranches, type ServiceBranch } from './service-directory';
export function parseBranchImport(text: string, existing: ServiceBranch[]) {
  const rows: Omit<ServiceBranch, 'id'>[] = [];
  const errors: string[] = [];
  const key = (city: string, address: string) => [normalizeServiceCity(city), address].map(s => s.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()).join('|');
  const seen = new Set(existing.map(b => key(b.city, b.address)));
  let duplicates = 0;
  text.split(/\r?\n/).forEach((line, index) => {
    if (!line.trim()) return;
    const cells = line.split(line.includes('\t') ? '\t' : '|').map(s => s.trim());
    if (cells.length < 3 || cells.length > 4) { errors.push(`Строка ${index + 1}: нужны название, город, адрес и необязательный телефон.`); return; }
    const [name, city, address, phone = ''] = cells;
    const row = { name, city: normalizeServiceCity(city), address, phone };
    if (!validServiceBranches([{ ...row, id: '00000000-0000-4000-8000-000000000000' }])) { errors.push(`Строка ${index + 1}: проверьте название, город, адрес и телефон.`); return; }
    const identity = key(row.city, row.address);
    if (seen.has(identity)) { duplicates++; return; }
    seen.add(identity); rows.push(row);
  });
  return { rows, errors, duplicates };
}
