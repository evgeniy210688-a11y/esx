import { contentError, defaultProfileContent, type ProfileContent, type ProfileButton } from './specialist-content';
import { splitServiceDescription, serviceItems } from './service-description';
export function profileTexts(data: { description: string; city: string; category: string; profile_content: unknown }): string[] {
  const content = splitServiceDescription(data.description);
  const texts = [content.description, ...serviceItems(content.services), data.city, data.category];
  const profile = data.profile_content ?? defaultProfileContent;
  if (!contentError(profile)) {
    function visit(buttons: ProfileButton[]) { for (const button of buttons) { texts.push(button.label, button.text); visit(button.children); } }
    for (const block of (profile as ProfileContent).blocks) { texts.push(block.title); visit(block.buttons); }
  }
  return [...new Set(texts.filter(text => text.trim()))];
}
export function profileBatches(texts: string[]): string[][] {
  const batches: string[][] = []; let batch: string[] = []; let size = 0;
  for (const text of texts) {
    if (batch.length && (size + text.length > 6000 || batch.length >= 40)) { batches.push(batch); batch = []; size = 0; }
    batch.push(text); size += text.length;
  }
  if (batch.length) batches.push(batch);
  return batches;
}
