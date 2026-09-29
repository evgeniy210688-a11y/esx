export const foxStickers = ['hello', 'heart', 'sleep', 'miss-you', 'tired', 'sad', 'joy', 'anger', 'longing', 'fear', 'surprise'] as const;
export type FoxSticker = typeof foxStickers[number];
export const stickerMessage = (id: FoxSticker) => '[esx-fox:' + id + ']';
export function getFoxSticker(message: string): FoxSticker | null {
  return foxStickers.find(id => message === stickerMessage(id)) ?? null;
}
export const stickerSource = (id: FoxSticker) => '/stickers/fox-' + id + '.gif';
