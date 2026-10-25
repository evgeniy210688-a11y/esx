// Keep the two editor fields in the existing text column, readable by older clients.
const separator = '\n\nУслуги:\n';
export function serviceItems(text: string): string[] {
  return text.split(/\r?\n/).map(line => line.trim().replace(/^[•●*-]\s+/, '')).filter(Boolean);
}
export function splitServiceDescription(text: string) {
  const normalized = text.replace(/\r\n/g, '\n');
  const index = normalized.lastIndexOf(separator);
  if (index < 0) return { description: text, services: '' };
  const lines = normalized.slice(index + separator.length).split('\n');
  if (!lines.length || !lines.every(line => line.startsWith('• ') && line.slice(2).trim())) return { description: text, services: '' };
  return { description: normalized.slice(0, index), services: lines.map(line => line.slice(2)).join('\n') };
}
export function joinServiceDescription(description: string, services: string) {
  const items = serviceItems(services);
  return description.trim() + (items.length ? separator + items.map(item => '• ' + item).join('\n') : '');
}

export function specialistRole(description: string, translated?: string) {
  const source = description.match(/^Должность: ([^\n]+)\n\n/);
  if (!source) return {role: '', description: translated ?? description};
  const text = translated ?? description;
  const localized = text.match(/^[^:\n：]{1,60}[:：]\s*([^\n]+)\n\n/);
  return {role: localized?.[1].trim() || source[1].trim(), description: localized ? text.slice(localized[0].length) : text};
}
