import type { InterfaceLanguage } from '../serviceLabels';
const ru = ['Назад','Описание','Языки общения','Услуги','Контакты','Наш адрес','Свернуть','Уточните услуги у специалиста.','Контакты пока не указаны.','Адрес пока не указан. Уточните его у специалиста.','Выберите офис','Паран','Инчхон','Переводим страницу…','Перевод недоступен. Показан исходный текст.','Повторить','Выберите тему','Вложенные кнопки','Вопросы по документам','Без названия'];
const copy: Record<InterfaceLanguage,string[]> = {
ru,
en:['Back','Description','Languages spoken','Services','Contacts','Our address','Show less','Please ask the specialist about services.','Contact details are not available yet.','Please ask the specialist for the address.','Choose an office','Paran','Incheon','Translating the page…','Translation unavailable. Original text is shown.','Retry','Choose a topic','More options','Document questions','Untitled'],
ko:['뒤로','소개','상담 가능 언어','서비스','연락처','오시는 길','접기','서비스는 전문가에게 문의해 주세요.','연락처가 아직 등록되지 않았습니다.','주소는 전문가에게 문의해 주세요.','사무실 선택','발안','인천','페이지 번역 중…','번역할 수 없어 원문을 표시합니다.','다시 시도','주제 선택','하위 항목','서류 관련 문의','제목 없음'],
uz:['Orqaga','Tavsif','Muloqot tillari','Xizmatlar','Aloqa','Manzilimiz','Yig‘ish','Xizmatlarni mutaxassisdan aniqlashtiring.','Aloqa ma’lumotlari hali kiritilmagan.','Manzilni mutaxassisdan aniqlashtiring.','Ofisni tanlang','Paran','Incheon','Sahifa tarjima qilinmoqda…','Tarjima mavjud emas. Asl matn ko‘rsatilmoqda.','Qayta urinish','Mavzuni tanlang','Ichki tugmalar','Hujjatlar bo‘yicha savollar','Nomsiz'],
zh:['返回','简介','沟通语言','服务','联系方式','我们的地址','收起','请向专家咨询服务详情。','暂无联系方式。','请向专家咨询地址。','选择办公室','Paran','仁川','正在翻译页面…','暂时无法翻译，显示原文。','重试','选择主题','子选项','文件相关问题','未命名'],
vi:['Quay lại','Giới thiệu','Ngôn ngữ giao tiếp','Dịch vụ','Liên hệ','Địa chỉ','Thu gọn','Vui lòng hỏi chuyên gia về dịch vụ.','Chưa có thông tin liên hệ.','Vui lòng hỏi chuyên gia về địa chỉ.','Chọn văn phòng','Paran','Incheon','Đang dịch trang…','Không thể dịch. Đang hiển thị bản gốc.','Thử lại','Chọn chủ đề','Tùy chọn con','Câu hỏi về giấy tờ','Chưa có tên'],
tr:['Geri','Açıklama','Konuşulan diller','Hizmetler','İletişim','Adresimiz','Daralt','Hizmetler hakkında uzmana danışın.','İletişim bilgileri henüz eklenmedi.','Adres için uzmana danışın.','Ofis seçin','Paran','Incheon','Sayfa çevriliyor…','Çeviri kullanılamıyor. Orijinal metin gösteriliyor.','Tekrar dene','Konu seçin','Alt seçenekler','Belge soruları','Adsız']
};
export function profileLabel(language: InterfaceLanguage,text: string) { const index = ru.indexOf(text); return index < 0 ? text : copy[language][index]; }

export const profileCity: Record<InterfaceLanguage,string> = {
 ru:'Хвасонг, Паран',en:'Hwaseong, Paran',ko:'화성, 발안',uz:'Hwaseong, Paran',zh:'华城，Paran（발안）',vi:'Hwaseong, Paran',tr:'Hwaseong, Paran'
};
