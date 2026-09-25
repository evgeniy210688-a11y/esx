import type { Language } from './content';

export const contactLabels: Record<Language, { optional: string; button: string; help: string; status: string; sending: string; error: string; unavailable: string; limited: string }> = {
  "ru": {
    "optional": "необязательно",
    "button": "Отправить",
    "help": "Сообщение будет отправлено команде ESX.",
    "status": "Сообщение отправлено. Спасибо!",
    "sending": "Отправляем…",
    "error": "Не удалось отправить. Текст сохранён — попробуйте ещё раз.",
    "unavailable": "Отправка временно недоступна. Текст сохранён. Попробуйте позже.",
    "limited": "Слишком много попыток. Повторите через минуту."
  },
  "en": {
    "optional": "optional",
    "button": "Send",
    "help": "Your message will be emailed to the ESX team.",
    "status": "Message sent. Thank you!",
    "sending": "Sending…",
    "error": "Could not send. Your text is preserved — please try again.",
    "unavailable": "Sending is temporarily unavailable. Your text is preserved. Please try later.",
    "limited": "Too many attempts. Try again in a minute."
  },
  "ko": {
    "optional": "선택 사항",
    "button": "보내기",
    "help": "메시지를 ESX 팀에 이메일로 보냅니다.",
    "status": "메시지를 보냈습니다. 감사합니다!",
    "sending": "보내는 중…",
    "error": "전송하지 못했습니다. 입력한 내용은 유지됩니다. 다시 시도해 주세요.",
    "unavailable": "현재 전송할 수 없습니다. 입력한 내용은 유지됩니다. 나중에 다시 시도해 주세요.",
    "limited": "시도가 너무 많습니다. 1분 후 다시 시도해 주세요."
  },
  "zh": {
    "optional": "选填",
    "button": "发送",
    "help": "留言将通过邮件发送给 ESX 团队。",
    "status": "留言已发送，谢谢！",
    "sending": "正在发送…",
    "error": "发送失败。内容已保留，请重试。",
    "unavailable": "暂时无法发送。内容已保留，请稍后重试。",
    "limited": "尝试次数过多，请一分钟后重试。"
  },
  "tr": {
    "optional": "isteğe bağlı",
    "button": "Gönder",
    "help": "Mesajınız ESX ekibine e-posta ile gönderilecek.",
    "status": "Mesaj gönderildi. Teşekkürler!",
    "sending": "Gönderiliyor…",
    "error": "Gönderilemedi. Metniniz korundu, lütfen tekrar deneyin.",
    "unavailable": "Gönderim geçici olarak kullanılamıyor. Metniniz korundu. Lütfen daha sonra deneyin.",
    "limited": "Çok fazla deneme. Bir dakika sonra tekrar deneyin."
  },
  "vi": {
    "optional": "không bắt buộc",
    "button": "Gửi",
    "help": "Tin nhắn sẽ được gửi qua email cho nhóm ESX.",
    "status": "Đã gửi tin nhắn. Cảm ơn bạn!",
    "sending": "Đang gửi…",
    "error": "Không gửi được. Nội dung được giữ lại, vui lòng thử lại.",
    "unavailable": "Tạm thời không thể gửi. Nội dung được giữ lại. Vui lòng thử lại sau.",
    "limited": "Quá nhiều lần thử. Hãy thử lại sau một phút."
  },
  "km": {
    "optional": "មិនចាំបាច់",
    "button": "ផ្ញើ",
    "help": "សារនឹងត្រូវបានផ្ញើតាមអ៊ីមែលទៅក្រុម ESX។",
    "status": "បានផ្ញើសារ។ សូមអរគុណ!",
    "sending": "កំពុងផ្ញើ…",
    "error": "មិនអាចផ្ញើបានទេ។ អត្ថបទរបស់អ្នកត្រូវបានរក្សាទុក។ សូមព្យាយាមម្ដងទៀត។",
    "unavailable": "ការផ្ញើមិនអាចប្រើបានជាបណ្ដោះអាសន្ន។ អត្ថបទត្រូវបានរក្សាទុក។ សូមព្យាយាមម្ដងទៀតនៅពេលក្រោយ។",
    "limited": "បានព្យាយាមច្រើនដងពេក។ សូមព្យាយាមម្ដងទៀតក្នុងមួយនាទី។"
  },
  "kk": {
    "optional": "міндетті емес",
    "button": "Жіберу",
    "help": "Хабарлама ESX тобына электрондық пошта арқылы жіберіледі.",
    "status": "Хабарлама жіберілді. Рақмет!",
    "sending": "Жіберілуде…",
    "error": "Жіберу мүмкін болмады. Мәтін сақталды, қайталап көріңіз.",
    "unavailable": "Жіберу уақытша қолжетімсіз. Мәтін сақталды. Кейінірек қайталап көріңіз.",
    "limited": "Тым көп әрекет. Бір минуттан кейін қайталаңыз."
  }
};
