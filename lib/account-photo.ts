// Resize and re-encode photos, stripping original metadata and avoiding SVGs.
export async function prepareAccountPhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    throw new Error('invalid_photo');
  }
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 320;
    const context = canvas.getContext('2d');
    if (!context || !bitmap.width || !bitmap.height) throw new Error('invalid_photo');
    const side = Math.min(bitmap.width, bitmap.height);
    context.fillStyle = '#10223b';
    context.fillRect(0, 0, 320, 320);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 320, 320);
    const result = canvas.toDataURL('image/jpeg', 0.82);
    if (result.length > 131072) throw new Error('invalid_photo');
    return result;
  } finally { bitmap.close(); }
}
