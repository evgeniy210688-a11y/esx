import { type Language } from './content';
import AboutMissionArticle from './AboutMissionArticle';

const details: Record<Language, string[]> = {
  "ru": [
    "ESX — чтобы жить и общаться было комфортнее",
    "Мы создали ESX, чтобы людям было комфортнее жить, путешествовать и решать повседневные задачи в другой языковой среде. Языковой барьер мешает не только спросить, где магазин или туалет. Иногда человек хочет купить товар или заказать услугу, но не заходит в магазин и не обращается к специалисту, потому что не знает, как объяснить свой запрос или уточнить важные детали.",
    "От QR-кода к разговору",
    "Выберите язык сайта, нажмите «Начать общение» и покажите QR-код собеседнику. Он откроет ссылку на тот же чат, где вы сможете обмениваться сообщениями.",
    "Больше возможностей для клиентов и бизнеса",
    "ESX помогает покупателю и продавцу начать понятный разговор: узнать характеристики товара, уточнить цену, размер, наличие и условия услуги. Когда общаться проще, человеку легче выбрать нужное и решиться на покупку, а бизнесу — обслужить иностранных клиентов и не упустить обращение из-за языка. Наша цель — помогать компаниям привлекать больше клиентов и создавать больше возможностей для продаж.",
    "Открываем Корею вместе",
    "В разделе «Южная Корея» собраны праздники, места, статьи о культуре, K-pop и повседневной жизни. Ссылки на официальные сайты банков и компаний помогают продолжить знакомство со страной."
  ],
  "en": [
    "ESX — making everyday life and conversation easier",
    "We created ESX to make living, travelling and handling everyday tasks more comfortable across languages. A language barrier does more than make it hard to ask where a shop or restroom is. Someone may want a product or service but never enter the shop or contact the provider because they do not know how to explain their needs or ask for details.",
    "From a QR code to a conversation",
    "Choose your site language, select “Start a conversation” and show the QR code to the other person. It opens the same chat so you can exchange messages.",
    "More opportunities for customers and businesses",
    "ESX helps buyers and sellers start a conversation about product features, price, size, availability and service terms. Easier communication helps people make informed choices and feel ready to buy, while businesses can serve international customers without losing enquiries to language barriers. Our goal is to help companies reach more customers and create more sales opportunities.",
    "Discover Korea together",
    "The South Korea section brings together holidays, places and articles about culture, K-pop and everyday life. Links to official bank and company websites help you explore further."
  ],
  "ko": [
    "더 편안한 생활과 소통을 위한 ESX",
    "우리는 다른 언어 환경에서도 더 편안하게 생활하고 여행하며 일상의 일을 해결할 수 있도록 ESX를 만들었습니다. 언어 장벽은 가게나 화장실의 위치를 묻는 데만 영향을 주지 않습니다. 물건을 사거나 서비스를 이용하고 싶어도 원하는 것을 설명하거나 자세히 물어볼 방법을 몰라 방문이나 문의를 포기하기도 합니다.",
    "QR코드로 시작하는 대화",
    "사이트 언어를 선택하고 대화 시작을 누른 뒤 상대방에게 QR코드를 보여 주세요. 같은 채팅방이 열리면 메시지를 주고받을 수 있습니다.",
    "고객과 사업자에게 더 많은 기회를",
    "ESX는 구매자와 판매자가 제품의 특징, 가격, 크기, 재고, 서비스 조건을 편하게 이야기하도록 돕습니다. 소통이 쉬워지면 고객은 필요한 것을 선택하고 구매하기가 편해지고, 사업자는 언어 때문에 문의를 놓치지 않고 외국인 고객을 응대할 수 있습니다. 더 많은 고객과 연결되고 판매 기회를 넓히도록 돕는 것이 우리의 목표입니다.",
    "함께 알아가는 한국",
    "한국 섹션에는 공휴일, 장소, 문화, K-pop과 일상에 관한 글이 있습니다. 은행과 기업의 공식 사이트 링크로 더 자세히 알아볼 수 있습니다."
  ],
  "zh": [
    "ESX：让生活与交流更轻松",
    "我们创建ESX，是为了让人们在不同语言环境中更舒适地生活、旅行和处理日常事务。语言障碍不仅影响询问商店或洗手间在哪里。有时人们想购买商品或使用服务，却因为不知道如何表达需求或询问细节，干脆不进店、不联系服务提供者。",
    "从二维码开始交流",
    "选择网站语言，点击开始交流，并向对方展示二维码。链接会打开同一个聊天室，方便互发消息。",
    "为顾客与商家创造更多机会",
    "ESX帮助买卖双方就商品特点、价格、尺寸、库存和服务条件展开清晰的交流。沟通更容易，顾客就更容易做出合适的选择并决定购买；商家也能更好地接待外国顾客，减少因语言问题而错失的咨询。我们的目标是帮助企业接触更多客户，创造更多销售机会。",
    "一起了解韩国",
    "韩国栏目汇集节日、地点、文化、K-pop和日常生活文章。银行与企业官方网站链接帮助您进一步了解韩国。"
  ],
  "tr": [
    "ESX — daha rahat bir yaşam ve iletişim için",
    "ESX’i farklı dillerin konuşulduğu ortamlarda yaşamayı, seyahat etmeyi ve günlük işleri kolaylaştırmak için kurduk. Dil engeli yalnızca bir mağazanın veya tuvaletin yerini sormayı zorlaştırmaz. İnsanlar bir ürün ya da hizmet istedikleri hâlde ihtiyaçlarını nasıl anlatacaklarını veya ayrıntıları nasıl soracaklarını bilmedikleri için mağazaya girmeyebilir, hizmet sağlayıcıya başvurmayabilir.",
    "QR koddan sohbete",
    "Site dilinizi seçin, sohbet başlat düğmesine basın ve QR kodu karşınızdakine gösterin. Bağlantı aynı sohbeti açar; mesajlaşmaya başlayabilirsiniz.",
    "Müşteriler ve işletmeler için daha fazla fırsat",
    "ESX, alıcı ve satıcının ürün özellikleri, fiyat, beden, stok ve hizmet koşulları hakkında anlaşılır bir konuşma başlatmasına yardımcı olur. Kolay iletişim müşterinin seçimini ve satın alma kararını destekler; işletmelerin yabancı müşterilere hizmet vermesini kolaylaştırır. Amacımız işletmeleri daha fazla müşteriyle buluşturmak ve satış fırsatlarını artırmalarına yardımcı olmaktır.",
    "Kore’yi birlikte keşfedin",
    "Güney Kore bölümünde tatiller, yerler, kültür, K-pop ve günlük yaşam yazıları bulunur. Banka ve şirketlerin resmî sitelerine bağlantılar daha fazla bilgi sunar."
  ],
  "vi": [
    "ESX — để cuộc sống và giao tiếp dễ dàng hơn",
    "Chúng tôi tạo ESX để mọi người sống, du lịch và giải quyết việc hằng ngày thoải mái hơn trong môi trường khác ngôn ngữ. Rào cản ngôn ngữ không chỉ gây khó khi hỏi cửa hàng hay nhà vệ sinh ở đâu. Có người muốn mua hàng hoặc sử dụng dịch vụ nhưng không vào cửa hàng hay liên hệ vì không biết diễn đạt nhu cầu và hỏi rõ thông tin.",
    "Từ mã QR đến cuộc trò chuyện",
    "Chọn ngôn ngữ trang web, nhấn bắt đầu trò chuyện và đưa mã QR cho người đối diện. Liên kết mở cùng phòng chat để hai người trao đổi tin nhắn.",
    "Thêm cơ hội cho khách hàng và doanh nghiệp",
    "ESX giúp người mua và người bán trao đổi về đặc điểm sản phẩm, giá, kích cỡ, tình trạng hàng và điều kiện dịch vụ. Giao tiếp dễ hơn giúp khách lựa chọn phù hợp và tự tin mua hàng; doanh nghiệp cũng có thể phục vụ khách nước ngoài và giảm bỏ lỡ yêu cầu do ngôn ngữ. Mục tiêu của chúng tôi là giúp doanh nghiệp tiếp cận nhiều khách hàng và tạo thêm cơ hội bán hàng.",
    "Cùng khám phá Hàn Quốc",
    "Mục Hàn Quốc có ngày lễ, địa điểm và bài viết về văn hóa, K-pop, cuộc sống thường ngày. Các liên kết đến trang chính thức của ngân hàng và doanh nghiệp giúp bạn tìm hiểu thêm."
  ],
  "km": [
    "ESX — ដើម្បីឱ្យជីវិត និងការសន្ទនាកាន់តែងាយស្រួល",
    "យើងបង្កើត ESX ដើម្បីឱ្យមនុស្សរស់នៅ ធ្វើដំណើរ និងដោះស្រាយការងារប្រចាំថ្ងៃកាន់តែស្រួលក្នុងបរិយាកាសភាសាផ្សេង។ ឧបសគ្គភាសាមិនត្រឹមតែធ្វើឱ្យពិបាកសួរថាហាង ឬបង្គន់នៅឯណាទេ។ មនុស្សខ្លះចង់ទិញទំនិញ ឬប្រើសេវា ប៉ុន្តែមិនចូលហាង ឬទាក់ទងអ្នកផ្តល់សេវា ព្រោះមិនដឹងរបៀបពន្យល់តម្រូវការ និងសួរព័ត៌មានលម្អិត។",
    "ពី QR ទៅការសន្ទនា",
    "ជ្រើសរើសភាសាគេហទំព័រ ចុចចាប់ផ្តើមសន្ទនា ហើយបង្ហាញកូដ QR ដល់ដៃគូ។ តំណនឹងបើកបន្ទប់ជជែកដូចគ្នា ដើម្បីផ្ញើសារទៅវិញទៅមក។",
    "ឱកាសកាន់តែច្រើនសម្រាប់អតិថិជន និងអាជីវកម្ម",
    "ESX ជួយអ្នកទិញ និងអ្នកលក់សន្ទនាអំពីលក្ខណៈទំនិញ តម្លៃ ទំហំ ស្តុក និងលក្ខខណ្ឌសេវា។ ពេលទំនាក់ទំនងងាយ អតិថិជនអាចជ្រើសរើស និងសម្រេចចិត្តទិញកាន់តែស្រួល ហើយអាជីវកម្មអាចបម្រើអតិថិជនបរទេសដោយមិនបាត់បង់ការសាកសួរព្រោះភាសា។ គោលដៅយើងគឺជួយអាជីវកម្មជួបអតិថិជនកាន់តែច្រើន និងបង្កើតឱកាសលក់បន្ថែម។",
    "ស្វែងយល់ពីកូរ៉េជាមួយគ្នា",
    "ផ្នែកកូរ៉េខាងត្បូងមានថ្ងៃបុណ្យ ទីកន្លែង និងអត្ថបទអំពីវប្បធម៌ K-pop និងជីវិតប្រចាំថ្ងៃ។ តំណទៅគេហទំព័រផ្លូវការរបស់ធនាគារ និងក្រុមហ៊ុនជួយឱ្យស្វែងយល់បន្ថែម។"
  ],
  "kk": [
    "ESX — өмір мен қарым-қатынасты жеңілдету үшін",
    "Біз ESX-ті басқа тілдік ортада өмір сүруді, саяхаттауды және күнделікті істерді шешуді жайлы ету үшін жасадық. Тілдік кедергі дүкен не дәретхананың қайда екенін сұрауға ғана бөгет болмайды. Кейде адам тауар сатып алғысы немесе қызмет алғысы келеді, бірақ сұранысын қалай түсіндіріп, мәліметті қалай нақтылауды білмегендіктен дүкенге кірмейді не маманға хабарласпайды.",
    "QR-кодтан әңгімеге",
    "Сайт тілін таңдаңыз, әңгіме бастау түймесін басып, QR-кодты сұхбаттасыңызға көрсетіңіз. Сілтеме сол чатты ашады, сонда хабар алмаса аласыз.",
    "Клиенттер мен бизнеске көбірек мүмкіндік",
    "ESX сатып алушы мен сатушыға тауардың қасиеті, бағасы, өлшемі, қолжетімділігі және қызмет шарттары туралы түсінікті сөйлесуге көмектеседі. Қарым-қатынас жеңілдесе, клиентке таңдау жасап, сатып алу оңайырақ болады; бизнес шетелдік клиенттерге қызмет көрсетіп, тілге байланысты өтініштерді жоғалтпайды. Мақсатымыз — компанияларға көбірек клиентпен байланысып, сату мүмкіндіктерін кеңейтуге көмектесу.",
    "Кореяны бірге ашамыз",
    "Оңтүстік Корея бөлімінде мерекелер, орындар, мәдениет, K-pop және күнделікті өмір туралы мақалалар бар. Банктер мен компаниялардың ресми сайттарына сілтемелер елді тереңірек тануға көмектеседі."
  ]
};

const founderLabels: Record<Language, string> = {
  ru: 'основатель',
  en: 'Founder',
  ko: '설립자',
  zh: '创始人',
  tr: 'Kurucu',
  vi: 'Người sáng lập',
  km: 'ស្ថាបនិក',
  kk: 'Негізін қалаушы',
};

export default function AboutDetails({ language }: { language: Language }) {
  const text = details[language];
  return <div className="about-details">
    {[0, 2, 4, 6].map((index) => (
      <section className="korea-story" key={index}>
        <h2>{text[index]}</h2>
        <p>{text[index + 1]}</p>
      </section>
    ))}
    <AboutMissionArticle language={language} />
    <p style={{ gridColumn: '1 / -1', fontSize: '12px', margin: 0 }}>
      {founderLabels[language]}: SON EVGENIY
    </p>
  </div>;
}
