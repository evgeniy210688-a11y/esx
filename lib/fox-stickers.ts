export const foxStickers = ['hello', 'heart', 'sleep', 'miss-you', 'tired', 'sad', 'joy', 'anger', 'longing', 'fear', 'surprise', 'congrats', 'thanks', 'please', 'hugs'] as const;
export type FoxSticker = typeof foxStickers[number];
export const stickerMessage = (id: FoxSticker) => '[esx-fox:' + id + ']';
export function getFoxSticker(message: string): FoxSticker | null {
  return foxStickers.find(id => message === stickerMessage(id)) ?? null;
}
const cleanEdges: ReadonlySet<FoxSticker> = new Set(['sad', 'joy', 'surprise', 'thanks', 'tired', 'please', 'fear']);
export const stickerSource = (id: FoxSticker) => cleanEdges.has(id) ? `/stickers/fox-${id}-clean-v2.gif` : '/stickers/fox-' + id + (id === 'congrats' ? '.png' : '.gif');
