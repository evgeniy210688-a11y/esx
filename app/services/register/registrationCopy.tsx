import { Children, cloneElement, isValidElement, type ReactNode } from 'react';
import type { InterfaceLanguage } from '../serviceLabels';
import { categoryTranslation } from '@/lib/service-category-labels';
const rows = [
'Я принимаю правила размещения и подтверждаю право представлять компанию или специалиста и использовать переданные материалы.|I accept the listing rules and confirm my authority to represent the company or specialist and use the submitted materials.|등록 규칙에 동의하며 해당 업체 또는 전문가를 대리하고 제출 자료를 사용할 권한이 있음을 확인합니다.|Joylashtirish qoidalarini qabul qilaman va kompaniya yoki mutaxassis nomidan ish yuritish hamda taqdim etilgan materiallardan foydalanish huquqimni tasdiqlayman.|我接受发布规则，并确认有权代表该公司或专业人士及使用提交的材料。|Tôi chấp nhận quy định đăng tin và xác nhận quyền đại diện cho công ty hoặc chuyên gia và sử dụng tài liệu đã gửi.|İlan kurallarını kabul ediyor, şirketi veya uzmanı temsil etme ve gönderilen materyalleri kullanma yetkimi doğruluyorum.',
'Я разрешаю публичное размещение сведений карточки, контактов и добавленного фото после одобрения заявки, включая их перевод.|I authorize public display of the listing details, contact information and uploaded photo after approval, including translation.|승인 후 등록 정보, 연락처 및 첨부 사진의 공개와 번역을 허용합니다.|Ariza tasdiqlangach, kartochka ma’lumotlari, aloqa ma’lumotlari va qo‘shilgan suratni, jumladan tarjimasini ochiq e’lon qilishga ruxsat beraman.|我允许申请获批后公开展示资料卡信息、联系方式及上传的照片，包括翻译。|Tôi cho phép công khai thông tin hồ sơ, liên hệ và ảnh đã tải lên sau khi được duyệt, bao gồm bản dịch.|Onay sonrasında ilan bilgilerinin, iletişim bilgilerinin ve yüklenen fotoğrafın çevirileriyle birlikte yayımlanmasına izin veriyorum.',

'Категория|Category|분야|Toifa|类别|Danh mục|Kategori',
'Не удалось загрузить заявки.|Could not load applications.|신청 목록을 불러오지 못했습니다.|Arizalarni yuklab bo‘lmadi.|无法加载申请。|Không thể tải danh sách đơn.|Başvurular yüklenemedi.',
'Фото для заявки|Application photo|신청 사진|Ariza uchun surat|申请照片|Ảnh đăng ký|Başvuru fotoğrafı',
'Справочник|Directory|업체 안내|Ma’lumotnoma|服务目录|Danh bạ|Rehber',
'Мой аккаунт|My account|내 계정|Mening hisobim|我的账户|Tài khoản của tôi|Hesabım',
'Регистрация в справочнике|Directory registration|업체 등록|Ma’lumotnomaga ro‘yxatdan o‘tish|目录注册|Đăng ký danh bạ|Rehbere kayıt',
'Добавьте компанию или специалиста. Карточка появится на сайте только после проверки и одобрения администратором.|Add a company or specialist. Listings appear after administrator approval.|업체 또는 전문가를 등록하세요. 관리자 승인 후 게시됩니다.|Kompaniya yoki mutaxassis qo‘shing. E’lon administrator tasdig‘idan so‘ng chiqadi.|添加公司或专业人士，管理员审核通过后发布。|Thêm công ty hoặc chuyên gia. Thông tin được đăng sau khi quản trị viên duyệt.|Şirket veya uzman ekleyin. Kayıt yönetici onayından sonra yayınlanır.',
'Проверяем вход…|Checking sign-in…|로그인 확인 중…|Kirish tekshirilmoqda…|正在检查登录…|Đang kiểm tra đăng nhập…|Giriş kontrol ediliyor…',
'Войдите или создайте аккаунт, чтобы отправить заявку.|Sign in or create an account to submit.|신청하려면 로그인하거나 가입하세요.|Ariza yuborish uchun kiring yoki hisob yarating.|请登录或创建账户以提交申请。|Đăng nhập hoặc tạo tài khoản để gửi.|Başvurmak için giriş yapın veya hesap oluşturun.',
'Мои заявки|My applications|내 신청|Mening arizalarim|我的申请|Đơn của tôi|Başvurularım',
'Новая заявка|New application|새 신청|Yangi ariza|新申请|Đơn mới|Yeni başvuru',
'Кого регистрируете?|Who are you registering?|등록 대상|Kimni ro‘yxatdan o‘tkazasiz?|注册对象|Bạn đăng ký cho ai?|Kimi kaydediyorsunuz?',
'Компания|Company|업체|Kompaniya|公司|Công ty|Şirket',
'Специалист|Specialist|전문가|Mutaxassis|专业人士|Chuyên gia|Uzman',
'Название компании|Company name|업체명|Kompaniya nomi|公司名称|Tên công ty|Şirket adı',
'Имя специалиста|Specialist name|전문가 이름|Mutaxassis ismi|专业人士姓名|Tên chuyên gia|Uzman adı',
'Категория компании|Company category|업체 분야|Kompaniya toifasi|公司类别|Danh mục công ty|Şirket kategorisi',
'Категория специалиста|Specialist category|전문가 분야|Mutaxassis toifasi|专业人士类别|Danh mục chuyên gia|Uzman kategorisi',
'Выберите категорию|Choose a category|분야 선택|Toifani tanlang|选择类别|Chọn danh mục|Kategori seçin',
'Новая услуга|New service|새 서비스|Yangi xizmat|新服务|Dịch vụ mới|Yeni hizmet',
'Должность|Job title|직함|Lavozim|职务|Chức danh|Unvan',
'Введите должность|Enter job title|직함 입력|Lavozimni kiriting|输入职务|Nhập chức danh|Unvan girin',
'По должности будет создана новая категория.|A new category will use this job title.|직함으로 새 분야가 생성됩니다.|Lavozim asosida yangi toifa yaratiladi.|将以职务创建新类别。|Chức danh sẽ tạo thành danh mục mới.|Bu unvanla yeni kategori oluşturulur.',
'Компания, которую представляете (необязательно)|Represented company (optional)|소속 업체 (선택)|Vakillik qilayotgan kompaniya (ixtiyoriy)|所代表公司（可选）|Công ty đại diện (không bắt buộc)|Temsil edilen şirket (isteğe bağlı)',
'Работаю переводчиком|I work as an interpreter|통역사입니다|Tarjimon bo‘lib ishlayman|我是口译员|Tôi là phiên dịch viên|Tercümanım',
'Город|City|도시|Shahar|城市|Thành phố|Şehir',
'Адрес|Address|주소|Manzil|地址|Địa chỉ|Adres',
'(необязательно)|(optional)|(선택)|(ixtiyoriy)|（可选）|(không bắt buộc)|(isteğe bağlı)',
'Укажите город, район и населённый пункт через запятую. При необходимости добавьте улицу и номер дома.|Enter city, district and locality separated by commas. Add street and building number if needed.|도시, 구, 읍·면을 쉼표로 구분하고 필요하면 도로명과 건물 번호를 입력하세요.|Shahar, tuman va aholi punktini vergul bilan yozing. Kerak bo‘lsa ko‘cha va uy raqamini qo‘shing.|用逗号分隔城市、区和地区，必要时添加街道和门牌号。|Nhập thành phố, quận và địa phương, cách nhau bằng dấu phẩy. Thêm đường và số nhà nếu cần.|Şehir, ilçe ve yerleşimi virgülle ayırın. Gerekirse sokak ve bina numarası ekleyin.',
'Телефоны|Phone numbers|전화번호|Telefonlar|电话号码|Số điện thoại|Telefonlar',
'Можно добавить до 5 номеров. Первый номер — основной.|Up to 5 numbers. The first is the primary number.|최대 5개. 첫 번호가 대표 번호입니다.|5 tagacha raqam. Birinchisi asosiy raqam.|最多5个号码，第一个为主要号码。|Tối đa 5 số. Số đầu tiên là số chính.|En fazla 5 numara. İlki ana numaradır.',
'Тип телефона|Phone type|전화 유형|Telefon turi|电话类型|Loại điện thoại|Telefon türü',
'Номер телефона|Phone number|전화번호|Telefon raqami|电话号码|Số điện thoại|Telefon numarası',
'Мобильный|Mobile|휴대전화|Mobil|手机|Di động|Cep',
'Офисный|Office|사무실|Ofis|办公电话|Văn phòng|Ofis',
'Другой|Other|기타|Boshqa|其他|Khác|Diğer',
'Убрать|Remove|삭제|Olib tashlash|移除|Xóa|Kaldır',
'+ Добавить телефон|+ Add phone|+ 전화 추가|+ Telefon qo‘shish|+ 添加电话|+ Thêm điện thoại|+ Telefon ekle',
'Сайт (необязательно)|Website (optional)|웹사이트 (선택)|Sayt (ixtiyoriy)|网站（可选）|Trang web (không bắt buộc)|Web sitesi (isteğe bağlı)',
'Социальные сети и мессенджеры (необязательно)|Social networks and messengers (optional)|SNS 및 메신저 (선택)|Ijtimoiy tarmoqlar (ixtiyoriy)|社交网络与通讯工具（可选）|Mạng xã hội và ứng dụng nhắn tin (không bắt buộc)|Sosyal ağlar ve mesajlaşma (isteğe bağlı)',
'Добавьте ссылки на страницы или чаты. До 12 ссылок.|Add up to 12 page or chat links.|페이지나 채팅 링크를 최대 12개 추가하세요.|Sahifa yoki chat havolalarini qo‘shing. 12 tagacha.|添加页面或聊天链接，最多12个。|Thêm tối đa 12 liên kết trang hoặc trò chuyện.|En fazla 12 sayfa veya sohbet bağlantısı ekleyin.',
'Соцсеть|Social network|SNS|Ijtimoiy tarmoq|社交网络|Mạng xã hội|Sosyal ağ',
'Ссылка|Link|링크|Havola|链接|Liên kết|Bağlantı',
'+ Добавить соцсеть|+ Add social network|+ SNS 추가|+ Tarmoq qo‘shish|+ 添加社交网络|+ Thêm mạng xã hội|+ Sosyal ağ ekle',
'Описание|Description|소개|Tavsif|简介|Mô tả|Açıklama',
'Услуги — по одной на строку|Services — one per line|서비스 — 한 줄에 하나씩|Xizmatlar — har satrda bittadan|服务——每行一项|Dịch vụ — mỗi dòng một mục|Hizmetler — her satıra bir tane',
'Языки общения|Languages spoken|상담 언어|Muloqot tillari|沟通语言|Ngôn ngữ giao tiếp|İletişim dilleri',
'/ перевода|/ interpreting|/ 통역|/ tarjima|/ 口译|/ phiên dịch|/ tercüme',
'Фото (необязательно)|Photo (optional)|사진 (선택)|Surat (ixtiyoriy)|照片（可选）|Ảnh (không bắt buộc)|Fotoğraf (isteğe bağlı)',
'Убрать фото|Remove photo|사진 삭제|Suratni olib tashlash|移除照片|Xóa ảnh|Fotoğrafı kaldır',
'После отправки данные передаются на проверку. Отправка заявки не означает публикацию.|Submissions are reviewed before publication.|제출 후 검토됩니다. 제출 즉시 게시되지는 않습니다.|Yuborilgan ariza tekshiriladi. Yuborish e’lon qilinishini anglatmaydi.|提交后需审核，并非立即发布。|Đơn được xét duyệt trước khi đăng.|Başvurular yayınlanmadan önce incelenir.',
'Отправляем…|Submitting…|제출 중…|Yuborilmoqda…|正在提交…|Đang gửi…|Gönderiliyor…',
'Отправить на проверку|Submit for review|검토 요청|Tekshiruvga yuborish|提交审核|Gửi xét duyệt|İncelemeye gönder',
'Подготавливаем фото…|Preparing photo…|사진 준비 중…|Surat tayyorlanmoqda…|正在处理照片…|Đang xử lý ảnh…|Fotoğraf hazırlanıyor…',
'Подать ещё одну заявку|Submit another application|추가 신청|Yana ariza yuborish|再次申请|Gửi đơn khác|Başka başvuru yap',
'Пока нет заявок.|No applications yet.|아직 신청이 없습니다.|Hali arizalar yo‘q.|暂无申请。|Chưa có đơn.|Henüz başvuru yok.',
'Повторить|Retry|다시 시도|Qayta urinish|重试|Thử lại|Tekrar dene',
'На проверке|Under review|검토 중|Tekshiruvda|审核中|Đang xét duyệt|İnceleniyor',
'На рассмотрении|Pending|대기 중|Ko‘rib chiqilmoqda|待处理|Đang chờ|Beklemede',
'Опубликовано|Published|게시됨|E’lon qilingan|已发布|Đã đăng|Yayınlandı',
'Не опубликовано|Not published|미게시|E’lon qilinmagan|未发布|Chưa đăng|Yayınlanmadı',
'Другая|Other|기타|Boshqa|其他|Khác|Diğer',
'Укажите категорию|Enter a category|카테고리 입력|Toifani kiriting|输入类别|Nhập danh mục|Kategori girin',
'+ Добавить категорию|+ Add category|+ 카테고리 추가|+ Toifa qo‘shish|+ 添加类别|+ Thêm danh mục|+ Kategori ekle',
'Есть переводчик|Interpreter available|통역사 있음|Tarjimon bor|有翻译员|Có phiên dịch viên|Tercüman var',
'Языки переводчика|Interpreter languages|통역 언어|Tarjimon tillari|翻译语言|Ngôn ngữ phiên dịch|Tercüman dilleri',
'Выберите языки переводчика|Choose interpreter languages|통역 언어를 선택하세요|Tarjimon tillarini tanlang|请选择翻译语言|Chọn ngôn ngữ phiên dịch|Tercüman dillerini seçin',
'Заявка отправлена на проверку. Статус объявления вы можете видеть в личном кабинете.|Your application has been submitted for review. You can view the listing status in your account.|신청서가 검토를 위해 제출되었습니다. 등록 상태는 내 계정에서 확인할 수 있습니다.|Arizangiz tekshirish uchun yuborildi. E’lon holatini shaxsiy kabinetingizda ko‘rishingiz mumkin.|申请已提交审核。您可以在个人中心查看信息的状态。|Đơn đã được gửi để xét duyệt. Bạn có thể xem trạng thái tin đăng trong tài khoản cá nhân.|Başvurunuz incelemeye gönderildi. İlanınızın durumunu hesabınızdan görebilirsiniz.',

];
const codes = ['ru','en','ko','uz','zh','vi','tr'];
const copy = new Map(rows.map(row => { const values=row.split('|'); return [values[0],values]; }));
export function registrationText(language:InterfaceLanguage,text:string):string {
  const trimmed=text.trim();
  const translated=copy.get(trimmed)?.[codes.indexOf(language)] ?? categoryTranslation(trimmed,language);
  return translated ? text.replace(trimmed,translated) : text;
}
export function registrationTree(node:ReactNode,language:InterfaceLanguage):ReactNode {
  return Children.map(node, child => {
    if(typeof child === 'string') return registrationText(language,child);
    if(!isValidElement<{children?:ReactNode;placeholder?:string;'aria-label'?:string;alt?:string}>(child)) return child;
    const props:Record<string,unknown>={};
    for(const key of ['placeholder','aria-label','alt'] as const) if(typeof child.props[key]==='string') props[key]=registrationText(language,child.props[key]!);
    if(child.props.children!==undefined)props.children=registrationTree(child.props.children,language);
    return cloneElement(child,props);
  });
}
