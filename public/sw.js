self.addEventListener('push', event => {
 let data={};try{data=event.data?.json()??{};}catch{}
 const url=typeof data.url==='string' && /^\/messages\/[0-9a-f-]{36}$/i.test(data.url)?data.url:'/account';
 event.waitUntil(self.registration.showNotification('ESX',{body:typeof data.body==='string'?data.body:'New message in ESX',icon:'/esx-logo.png',badge:'/esx-logo.png',tag:data.tag||'esx-message',data:{url}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const path=event.notification.data?.url;
 const url=new URL(typeof path==='string'&&/^\/messages\/[0-9a-f-]{36}$/i.test(path)?path:'/account',self.location.origin).href;
 event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{for(const win of windows){if(win.url===url)return win.focus();}return clients.openWindow(url);}));
});
