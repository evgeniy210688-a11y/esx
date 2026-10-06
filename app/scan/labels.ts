import type { Language } from '@/app/design/content';
export const scanLabels: Record<Language, string[]> = {
  en: ['Scan QR code', 'Start camera', 'Choose a QR image', 'Point the camera at a QR code.', 'Close camera', 'Camera unavailable. Allow camera access or choose an image.', 'No QR code found. Try another image.', 'QR code contents', 'Open link', 'Scan again'],
  ru: ['Сканировать QR-код', 'Включить камеру', 'Выбрать фото QR-кода', 'Наведите камеру на QR-код.', 'Выключить камеру', 'Камера недоступна. Разрешите доступ или выберите фото.', 'QR-код не найден. Выберите другое фото.', 'Содержимое QR-кода', 'Открыть ссылку', 'Сканировать ещё'],
  ko: ['QR 코드 스캔', '카메라 켜기', 'QR 이미지 선택', '카메라를 QR 코드에 비추세요.', '카메라 끄기', '카메라 권한을 허용하거나 이미지를 선택하세요.', 'QR 코드를 찾지 못했습니다. 다른 이미지를 선택하세요.', 'QR 코드 내용', '링크 열기', '다시 스캔'],
  zh: ['扫描二维码', '开启相机', '选择二维码图片', '将相机对准二维码。', '关闭相机', '请允许相机访问或选择图片。', '未找到二维码。请选择其他图片。', '二维码内容', '打开链接', '重新扫描'],
  tr: ['QR kodu tara', 'Kamerayı aç', 'QR resmi seç', 'Kamerayı QR koduna doğrultun.', 'Kamerayı kapat', 'Kamera izni verin veya bir resim seçin.', 'QR kodu bulunamadı. Başka bir resim seçin.', 'QR kodu içeriği', 'Bağlantıyı aç', 'Yeniden tara'],
  vi: ['Quét mã QR', 'Bật camera', 'Chọn ảnh QR', 'Hướng camera vào mã QR.', 'Tắt camera', 'Cho phép camera hoặc chọn ảnh.', 'Không tìm thấy mã QR. Chọn ảnh khác.', 'Nội dung mã QR', 'Mở liên kết', 'Quét lại'],
  km: ['ស្កេនកូដ QR', 'បើកកាមេរ៉ា', 'ជ្រើសរូបភាព QR', 'តម្រង់កាមេរ៉ាទៅកូដ QR។', 'បិទកាមេរ៉ា', 'អនុញ្ញាតកាមេរ៉ា ឬជ្រើសរូបភាព។', 'រកមិនឃើញកូដ QR។ សូមជ្រើសរូបភាពផ្សេង។', 'មាតិកាកូដ QR', 'បើកតំណ', 'ស្កេនម្ដងទៀត'],
  kk: ['QR кодын сканерлеу', 'Камераны қосу', 'QR суретін таңдау', 'Камераны QR кодына бағыттаңыз.', 'Камераны өшіру', 'Камераға рұқсат беріңіз немесе суретті таңдаңыз.', 'QR коды табылмады. Басқа суретті таңдаңыз.', 'QR кодының мазмұны', 'Сілтемені ашу', 'Қайта сканерлеу'],
};
