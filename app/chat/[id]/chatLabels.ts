import type { Language } from '@/app/design/content';

export const chatLabels: Record<Language, [string, string, string, string, string, string]> = {
  ru: ['Язык общения', 'Ваш язык', 'QR-код', 'Пригласить в этот чат', 'Покажите QR-код собеседнику, чтобы он открыл этот чат.', 'Закрыть'],
  en: ['Chat language', 'Your language', 'QR code', 'Invite to this chat', 'Show this QR code to your partner to open this chat.', 'Close'],
  ko: ['대화 언어', '내 언어', 'QR 코드', '이 채팅에 초대하기', '상대방에게 QR 코드를 보여주면 이 채팅을 열 수 있습니다.', '닫기'],
  zh: ['聊天语言', '你的语言', '二维码', '邀请加入聊天', '向对方出示二维码，即可打开此聊天。', '关闭'],
  tr: ['Sohbet dili', 'Diliniz', 'QR kodu', 'Bu sohbete davet et', 'Bu sohbeti açması için QR kodunu karşınızdaki kişiye gösterin.', 'Kapat'],
  vi: ['Ngôn ngữ trò chuyện', 'Ngôn ngữ của bạn', 'Mã QR', 'Mời vào cuộc trò chuyện', 'Cho người đối thoại xem mã QR để mở cuộc trò chuyện này.', 'Đóng'],
  km: ['ភាសាជជែក', 'ភាសារបស់អ្នក', 'កូដ QR', 'អញ្ជើញចូលការជជែកនេះ', 'បង្ហាញកូដ QR ដល់ដៃគូរបស់អ្នក ដើម្បីបើកការជជែកនេះ។', 'បិទ'],
  kk: ['Сөйлесу тілі', 'Сіздің тіліңіз', 'QR-код', 'Осы чатқа шақыру', 'Осы чатты ашу үшін сұхбаттасыңызға QR-кодты көрсетіңіз.', 'Жабу'],
};
