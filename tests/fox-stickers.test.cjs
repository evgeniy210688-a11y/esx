const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const context={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/fox-stickers.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
const {foxStickers,getFoxSticker,stickerMessage,stickerSource}=context.exports;
test('all twelve persisted stickers resolve to existing image assets',()=>{
 assert.equal(foxStickers.length,12);
 for(const id of foxStickers){assert.equal(getFoxSticker(stickerMessage(id)),id);const bytes=fs.readFileSync('public'+stickerSource(id));if(id==='congrats'){assert.equal(bytes.subarray(1,4).toString(),'PNG');}else{assert.equal(bytes.subarray(0,6).toString(),'GIF89a');assert.ok(bytes.includes(Buffer.from('NETSCAPE2.0')));}}
});
test('ordinary text, unknown stickers and external URLs remain text',()=>{
 for(const value of ['hello','[esx-fox:unknown]','[esx-fox:../heart]','https://example.com/a.gif','Look [esx-fox:heart]','[esx-fox:heart] extra']) assert.equal(getFoxSticker(value),null);
});
