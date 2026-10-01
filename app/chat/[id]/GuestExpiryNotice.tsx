import type { Language } from '@/app/design/content';

const notices: Record<Language, string> = {
  ru: 'Если общаются два гостя, история автоматически удаляется через час после последнего сообщения, даже если чат открыт. Новое сообщение запускает отсчёт заново. Чат сохраняется только у зарегистрированных пользователей.',
  en: 'When two guests chat, the history is automatically deleted one hour after the last message, even if the chat stays open. A new message restarts the timer. Chat history is saved only for registered users.',
  ko: '두 게스트가 대화하면 채팅창이 열려 있어도 마지막 메시지로부터 1시간 후 대화 기록이 자동 삭제됩니다. 새 메시지를 보내면 시간이 다시 시작됩니다. 대화 기록은 가입한 사용자에게만 저장됩니다.',
  zh: '两位访客聊天时，即使聊天窗口保持打开，聊天记录也会在最后一条消息发送一小时后自动删除。新消息会重新开始计时。 聊天记录仅为注册用户保存。',
  tr: 'İki misafir sohbet ettiğinde, sohbet açık kalsa bile geçmiş son mesajdan bir saat sonra otomatik silinir. Yeni mesaj süreyi yeniden başlatır. Sohbet geçmişi yalnızca kayıtlı kullanıcılar için saklanır.',
  vi: 'Khi hai khách trò chuyện, lịch sử sẽ tự động bị xóa sau một giờ kể từ tin nhắn cuối cùng, ngay cả khi cuộc trò chuyện vẫn mở. Tin nhắn mới sẽ bắt đầu lại thời gian đếm. Lịch sử trò chuyện chỉ được lưu cho người dùng đã đăng ký.',
  km: 'នៅពេលភ្ញៀវពីរនាក់ជជែកគ្នា ប្រវត្តិនឹងត្រូវលុបដោយស្វ័យប្រវត្តិមួយម៉ោងបន្ទាប់ពីសារចុងក្រោយ ទោះបីជាបើកការជជែកទុកក៏ដោយ។ សារថ្មីនឹងចាប់ផ្តើមរាប់ពេលឡើងវិញ។ ប្រវត្តិជជែកត្រូវបានរក្សាទុកសម្រាប់តែអ្នកប្រើដែលបានចុះឈ្មោះប៉ុណ្ណោះ។',
  kk: 'Екі қонақ сөйлескенде, чат ашық тұрса да, соңғы хабарламадан бір сағат өткен соң тарих автоматты түрде өшіріледі. Жаңа хабарлама уақыт санағын қайта бастайды. Чат тарихы тек тіркелген пайдаланушылар үшін сақталады.',
};

export default function GuestExpiryNotice({ language }: { language: Language }) {
  return <p className="chat-expiry-notice" role="note">{notices[language]}</p>;
}
