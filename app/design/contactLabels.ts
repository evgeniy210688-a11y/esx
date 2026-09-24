import type { Language } from './content';

export const contactEmail = '88esx88@gmail.com';

export const contactLabels: Record<Language, { button: string; help: string; status: string }> = {
  ru: {
    button: 'Открыть письмо',
    help: 'Откроется ваше почтовое приложение с заполненным письмом. Нажмите в нём «Отправить». Можно также написать напрямую:',
    status: 'Письмо нужно отправить в почтовом приложении. Если оно не открылось, скопируйте сообщение и напишите на адрес выше.',
  },
  en: {
    button: 'Open email',
    help: 'Your email app will open with a prepared message. Press Send there. You can also email us directly:',
    status: 'Send the message in your email app. If it did not open, copy your message and email the address above.',
  },
  ko: {
    button: '이메일 열기',
    help: '작성된 메시지가 이메일 앱에서 열립니다. 앱에서 보내기를 눌러 주세요. 아래 주소로 직접 보내셔도 됩니다:',
    status: '이메일 앱에서 메시지를 보내 주세요. 앱이 열리지 않으면 메시지를 복사하여 위 주소로 보내 주세요.',
  },
  zh: {
    button: '打开邮件',
    help: '将打开邮件应用并填入内容。请在应用中点击发送。您也可以直接发送邮件至：',
    status: '请在邮件应用中发送。如果应用未打开，请复制留言并发送到上方地址。',
  },
  tr: {
    button: 'E-postayı aç',
    help: 'Hazırlanan mesaj e-posta uygulamanızda açılır. Orada Gönder düğmesine basın. Doğrudan da yazabilirsiniz:',
    status: 'Mesajı e-posta uygulamanızdan gönderin. Uygulama açılmadıysa mesajınızı kopyalayıp yukarıdaki adrese gönderin.',
  },
  vi: {
    button: 'Mở email',
    help: 'Ứng dụng email sẽ mở với nội dung đã điền. Hãy nhấn Gửi trong ứng dụng. Bạn cũng có thể gửi trực tiếp đến:',
    status: 'Hãy gửi thư trong ứng dụng email. Nếu ứng dụng không mở, sao chép nội dung và gửi đến địa chỉ phía trên.',
  },
  km: {
    button: 'បើកអ៊ីមែល',
    help: 'កម្មវិធីអ៊ីមែលនឹងបើកជាមួយសារដែលបានរៀបចំ។ សូមចុចផ្ញើក្នុងកម្មវិធីនោះ។ អ្នកក៏អាចផ្ញើដោយផ្ទាល់ទៅ៖',
    status: 'សូមផ្ញើសារក្នុងកម្មវិធីអ៊ីមែល។ ប្រសិនបើកម្មវិធីមិនបើក សូមចម្លងសារហើយផ្ញើទៅអាសយដ្ឋានខាងលើ។',
  },
  kk: {
    button: 'Хатты ашу',
    help: 'Дайын хат пошта қолданбасында ашылады. Сол жерде «Жіберу» түймесін басыңыз. Тікелей де жаза аласыз:',
    status: 'Хатты пошта қолданбасында жіберіңіз. Қолданба ашылмаса, хабарламаны көшіріп, жоғарыдағы мекенжайға жіберіңіз.',
  },
};
