// Normalize legacy Uzbek Cyrillic translations to the interface's Latin alphabet.
const letters: Record<string, string> = {
  а:'a',б:'b',в:'v',г:'g',д:'d',ё:'yo',ж:'j',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'x',ц:'ts',ч:'ch',ш:'sh',щ:'sh',ъ:'ʼ',ы:'i',ь:'',э:'e',ю:'yu',я:'ya',ў:'o‘',қ:'q',ғ:'g‘',ҳ:'h',
};
export function uzbekLatin(text: string): string {
  return text.replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g, (letter, offset: number) => {
    const lower = letter.toLowerCase();
    const value = lower === 'е' ? (offset === 0 || /[\s\p{P}аеиоуўэюяё]/iu.test(text[offset - 1]) ? 'ye' : 'e') : letters[lower];
    if (letter === lower) return value;
    const allCaps = /[А-ЯЁЎҚҒҲ]/.test(text[offset + 1] ?? '') || /[А-ЯЁЎҚҒҲ]/.test(text[offset - 1] ?? '');
    return allCaps ? value.toUpperCase() : value.charAt(0).toUpperCase() + value.slice(1);
  });
}
