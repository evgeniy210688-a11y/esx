import type { Language } from './content';

const guide: Record<Language, [string, string, string, string, string, string]> = {
  ru: ['Общайтесь на разных языках', 'ESX — чат с автоматическим переводом входящих сообщений на выбранный язык. Для знакомства, общения с гостями, клиентами и партнёрами.', 'Как пользоваться', 'Нажмите «Начать общение». Откройте чат или свой QR-код в аккаунте.', 'Пригласите собеседника: покажите QR-код или отправьте ссылку на чат.', 'Выберите язык входящих сообщений и пишите на своём. ESX переведёт сообщения собеседника.'],
  en: ['Talk across languages', 'ESX is a chat that automatically translates incoming messages into your chosen language. Connect with new people, guests, customers and partners.', 'How to use ESX', 'Tap the start button. Open a chat or your QR code in your account.', 'Invite someone by showing your QR code or sharing a chat link.', 'Choose a language for incoming messages and write in your own. ESX translates the replies.'],
  ko: ['서로 다른 언어로 소통하세요', 'ESX는 받은 메시지를 선택한 언어로 자동 번역하는 채팅입니다. 새로운 친구, 손님, 고객, 파트너와 대화하세요.', '이용 방법', '대화 시작 버튼을 누르세요. 채팅을 열거나 계정에서 내 QR 코드를 확인하세요.', 'QR 코드를 보여 주거나 채팅 링크를 보내 상대방을 초대하세요.', '받을 메시지의 언어를 선택하고 자신의 언어로 입력하세요. ESX가 상대방의 메시지를 번역합니다.'],
  zh: ['跨越语言交流', 'ESX聊天会将收到的消息自动翻译成您选择的语言，方便与新朋友、宾客、客户和合作伙伴交流。', '使用方法', '点击开始交流按钮。打开聊天或账户中的个人二维码。', '出示二维码或分享聊天链接，邀请对方加入。', '选择接收消息的语言，用自己的语言输入。ESX会翻译对方的消息。'],
  tr: ['Farklı dillerde iletişim kurun', 'ESX, gelen mesajları seçtiğiniz dile otomatik çeviren bir sohbettir. Yeni kişiler, misafirler, müşteriler ve ortaklarla iletişim kurun.', 'Nasıl kullanılır', 'Sohbeti başlat düğmesine dokunun. Sohbeti veya hesabınızdaki QR kodunu açın.', 'QR kodunuzu göstererek ya da sohbet bağlantısını paylaşarak birini davet edin.', 'Gelen mesajlar için dil seçin ve kendi dilinizde yazın. ESX karşı tarafın mesajlarını çevirir.'],
  vi: ['Trò chuyện giữa các ngôn ngữ', 'ESX tự động dịch tin nhắn nhận được sang ngôn ngữ bạn chọn. Kết nối với bạn mới, khách hàng và đối tác.', 'Cách sử dụng', 'Nhấn nút bắt đầu trò chuyện. Mở cuộc trò chuyện hoặc mã QR trong tài khoản.', 'Mời người khác bằng cách cho xem mã QR hoặc gửi liên kết trò chuyện.', 'Chọn ngôn ngữ cho tin nhắn nhận được và viết bằng ngôn ngữ của bạn. ESX dịch tin nhắn của đối phương.'],
  km: ['ទំនាក់ទំនងឆ្លងភាសា', 'ESX ជាការជជែកដែលបកប្រែសារចូលដោយស្វ័យប្រវត្តិទៅភាសាដែលអ្នកជ្រើសរើស សម្រាប់មិត្តថ្មី ភ្ញៀវ អតិថិជន និងដៃគូ។', 'របៀបប្រើ', 'ចុចប៊ូតុងចាប់ផ្តើមសន្ទនា។ បើកការជជែក ឬកូដ QR របស់អ្នកនៅក្នុងគណនី។', 'អញ្ជើញអ្នកដទៃដោយបង្ហាញកូដ QR ឬផ្ញើតំណការជជែក។', 'ជ្រើសភាសាសម្រាប់សារចូល ហើយសរសេរជាភាសារបស់អ្នក។ ESX បកប្រែសាររបស់ដៃគូសន្ទនា។'],
  kk: ['Әртүрлі тілде сөйлесіңіз', 'ESX — кіріс хабарламаларды таңдаған тіліңізге автоматты аударатын чат. Жаңа таныстармен, қонақтармен, клиенттермен және серіктестермен сөйлесіңіз.', 'Қалай қолдануға болады', 'Сөйлесуді бастау түймесін басыңыз. Чатты немесе аккаунттағы QR-кодыңызды ашыңыз.', 'QR-кодты көрсетіп немесе чат сілтемесін жіберіп, әңгімелесушіні шақырыңыз.', 'Кіріс хабарламалардың тілін таңдап, өз тіліңізде жазыңыз. ESX әңгімелесушінің хабарламаларын аударады.'],
};

const accountNotes: Record<Language, [string, string, string, string]> = {
  "ru": [
    "Без регистрации",
    "Одноразовый чат для быстрого общения.",
    "После регистрации",
    "У вас появится постоянный QR-код, а переписки будут сохраняться в аккаунте."
  ],
  "en": [
    "Without registration",
    "A one-time chat for quick conversations.",
    "After registration",
    "You get a permanent QR code, and your conversations are saved in your account."
  ],
  "ko": [
    "가입 없이",
    "빠르게 대화할 수 있는 일회용 채팅입니다.",
    "가입 후",
    "고정 QR 코드가 생기고 대화가 계정에 저장됩니다."
  ],
  "zh": [
    "无需注册",
    "适合快速交流的一次性聊天。",
    "注册后",
    "您将获得固定二维码，聊天记录会保存在账户中。"
  ],
  "tr": [
    "Kayıt olmadan",
    "Hızlı iletişim için tek kullanımlık sohbet.",
    "Kayıt olduktan sonra",
    "Kalıcı bir QR kodunuz olur ve sohbetleriniz hesabınızda saklanır."
  ],
  "vi": [
    "Không đăng ký",
    "Cuộc trò chuyện dùng một lần để trao đổi nhanh.",
    "Sau khi đăng ký",
    "Bạn có mã QR cố định và các cuộc trò chuyện được lưu trong tài khoản."
  ],
  "km": [
    "ដោយមិនចុះឈ្មោះ",
    "ការជជែកប្រើម្តងសម្រាប់ទំនាក់ទំនងរហ័ស។",
    "បន្ទាប់ពីចុះឈ្មោះ",
    "អ្នកនឹងមានកូដ QR អចិន្ត្រៃយ៍ ហើយការសន្ទនាត្រូវបានរក្សាទុកក្នុងគណនី។"
  ],
  "kk": [
    "Тіркелмей",
    "Жылдам сөйлесуге арналған бір реттік чат.",
    "Тіркелгеннен кейін",
    "Тұрақты QR-кодыңыз пайда болады, ал хат алмасулар аккаунтыңызда сақталады."
  ]
};

export default function MobileFoxGuide({ language }: { language: Language }) {
  const text = guide[language];
  const note = accountNotes[language];
  return <section className="mobile-fox-guide" aria-labelledby="mobile-fox-guide-title" lang={language}>
    <h2 id="mobile-fox-guide-title">{text[0]}</h2>
    <p>{text[1]}</p>
    <h3>{text[2]}</h3>
    <ol>{text.slice(3).map(step => <li key={step}>{step}</li>)}</ol>
    <div className="mobile-fox-account-note"><h3>{note[0]}</h3><p>{note[1]}</p><h3>{note[2]}</h3><p>{note[3]}</p></div>
  </section>;
}
