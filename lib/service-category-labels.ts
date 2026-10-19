// Canonical category labels are UI text and never require a translation request.
const languages = ['ru', 'en', 'ko', 'uz', 'zh', 'vi', 'tr'];
const rows = [
'Медицина и клиники|Medicine and clinics|의료 및 클리닉|Tibbiyot va klinikalar|医疗与诊所|Y tế và phòng khám|Tıp ve klinikler',
'Стоматология|Dentistry|치과|Stomatologiya|牙科|Nha khoa|Diş hekimliği',
'Красота и уход|Beauty and care|미용 및 관리|Go‘zallik va parvarish|美容与护理|Làm đẹp và chăm sóc|Güzellik ve bakım',
'Массаж и спа|Massage and spa|마사지 및 스파|Massaj va spa|按摩与水疗|Mát-xa và spa|Masaj ve spa',
'Переводчики|Interpreters|통역사|Tarjimonlar|翻译人员|Phiên dịch viên|Tercümanlar',
'Переводчик|Interpreter|통역사|Tarjimon|翻译员|Phiên dịch viên|Tercüman',
'Юридические услуги|Legal services|법률 서비스|Yuridik xizmatlar|法律服务|Dịch vụ pháp lý|Hukuk hizmetleri',
'Визы и иммиграция|Visas and immigration|비자 및 이민|Viza va immigratsiya|签证与移民|Thị thực và nhập cư|Vize ve göçmenlik',
'Бухгалтерия и налоги|Accounting and taxes|회계 및 세무|Buxgalteriya va soliqlar|会计与税务|Kế toán và thuế|Muhasebe ve vergiler',
'Банки и денежные переводы|Banks and money transfers|은행 및 송금|Banklar va pul o‘tkazmalari|银行与汇款|Ngân hàng và chuyển tiền|Bankalar ve para transferleri',
'Страхование|Insurance|보험|Sug‘urta|保险|Bảo hiểm|Sigorta',
'Недвижимость|Real estate|부동산|Ko‘chmas mulk|房地产|Bất động sản|Gayrimenkul',
'Работа и трудоустройство|Jobs and employment|일자리 및 취업|Ish va bandlik|工作与就业|Việc làm và tuyển dụng|İş ve istihdam',
'Образование|Education|교육|Ta’lim|教育|Giáo dục|Eğitim',
'Детские услуги|Services for children|아동 서비스|Bolalar uchun xizmatlar|儿童服务|Dịch vụ cho trẻ em|Çocuk hizmetleri',
'Автосервисы и ремонт|Auto service and repair|자동차 정비 및 수리|Avtoservis va ta’mirlash|汽车保养与维修|Bảo dưỡng và sửa chữa ô tô|Oto servis ve tamir',
'Покупка и аренда автомобилей|Car sales and rentals|자동차 구매 및 렌트|Avtomobil sotib olish va ijarasi|汽车购买与租赁|Mua và thuê ô tô|Araç satın alma ve kiralama',
'Такси и трансфер|Taxi and transfers|택시 및 픽업|Taksi va transfer|出租车与接送|Taxi và đưa đón|Taksi ve transfer',
'Доставка и грузоперевозки|Delivery and freight|배송 및 화물 운송|Yetkazib berish va yuk tashish|配送与货运|Giao hàng và vận tải|Teslimat ve yük taşımacılığı',
'Переезды|Moving services|이사|Ko‘chish xizmatlari|搬家服务|Dịch vụ chuyển nhà|Taşınma hizmetleri',
'Ремонт и строительство|Renovation and construction|수리 및 건설|Ta’mirlash va qurilish|装修与建筑|Sửa chữa và xây dựng|Tadilat ve inşaat',
'Уборка|Cleaning|청소|Tozalash|清洁|Vệ sinh|Temizlik',
'Ремонт техники|Appliance repair|가전제품 수리|Texnika ta’miri|家电维修|Sửa chữa thiết bị|Cihaz tamiri',
'Ювелирные мастерские|Jewelry workshops|귀금속 공방|Zargarlik ustaxonalari|珠宝工作室|Xưởng kim hoàn|Kuyumcu atölyeleri',
'Связь и интернет|Telecom and internet|통신 및 인터넷|Aloqa va internet|通信与互联网|Viễn thông và internet|İletişim ve internet',
'Рестораны и кафе|Restaurants and cafés|음식점 및 카페|Restoran va kafelar|餐厅与咖啡馆|Nhà hàng và quán cà phê|Restoranlar ve kafeler',
'Магазины и продукты|Shops and groceries|상점 및 식료품|Do‘konlar va oziq-ovqat|商店与食品|Cửa hàng và thực phẩm|Mağazalar ve gıda',
'Туризм и экскурсии|Tourism and tours|관광 및 투어|Turizm va ekskursiyalar|旅游与观光|Du lịch và tham quan|Turizm ve turlar',
'Отели и проживание|Hotels and accommodation|호텔 및 숙박|Mehmonxonalar va turar joy|酒店与住宿|Khách sạn và lưu trú|Oteller ve konaklama',
'Спорт и фитнес|Sports and fitness|스포츠 및 피트니스|Sport va fitnes|运动与健身|Thể thao và thể hình|Spor ve fitness',
'Фото и видео|Photography and video|사진 및 영상|Foto va video|摄影与视频|Ảnh và video|Fotoğraf ve video',
'Праздники и мероприятия|Celebrations and events|축제 및 행사|Bayramlar va tadbirlar|庆典与活动|Lễ hội và sự kiện|Kutlamalar ve etkinlikler',
'Услуги для животных|Pet services|반려동물 서비스|Hayvonlar uchun xizmatlar|宠物服务|Dịch vụ thú cưng|Evcil hayvan hizmetleri',
'Услуги для бизнеса|Business services|비즈니스 서비스|Biznes xizmatlari|企业服务|Dịch vụ doanh nghiệp|İşletme hizmetleri',
'Другие услуги|Other services|기타 서비스|Boshqa xizmatlar|其他服务|Dịch vụ khác|Diğer hizmetler',
];
const labels = new Map(rows.map(row => { const values = row.split('|'); return [values[0].normalize('NFKC').trim().toLowerCase(), values]; }));
export function categoryTranslation(category: string, language: string): string | undefined {
  return labels.get(category.normalize('NFKC').trim().toLowerCase())?.[languages.indexOf(language)];
}
