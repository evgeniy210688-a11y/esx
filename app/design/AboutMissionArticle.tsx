import Image from 'next/image';
import type { Language } from './content';

const article = {
  "ru": {
    "title": "Когда разговор становится возможностью",
    "intro": "Представьте обычный день в незнакомой стране. Вам нужно выбрать куртку, починить телефон, записаться на стрижку или узнать условия проживания. Деньги и желание обратиться есть, но одного не хватает — уверенности, что вас поймут. Именно для таких повседневных ситуаций мы создаём ESX. Мы хотим, чтобы незнание языка реже заставляло людей отказываться от нужных вещей, а бизнес — терять возможность помочь клиенту.",
    "sections": [
      [
        "Языковой барьер начинается ещё до первого вопроса",
        "Часто трудность возникает даже не во время разговора. Человек останавливается перед витриной и заранее думает: «А если мне ответят слишком быстро? Как спросить про другой размер? Смогу ли я объяснить, что именно мне нужно?» В итоге он проходит мимо, хотя был готов купить. Продавец даже не узнаёт, что рядом был потенциальный клиент.",
        "Поэтому для нас удобное общение — часть комфортной жизни. Вопрос о магазине или туалете важен, но за ним стоит гораздо больше: возможность самостоятельно выбирать, сравнивать предложения, уточнять условия и обращаться за помощью. ESX призван сделать первый шаг к разговору проще."
      ],
      [
        "Пример 1. Покупка одежды без догадок",
        "Покупателю понравилась куртка, но он не знает, как попросить размер побольше, уточнить материал и спросить об уходе. Одних жестов мало: вещь может выглядеть подходящей, но важные детали остаются непонятными. Иногда проще уйти, чем испытывать неловкость.",
        "Через чат можно последовательно задать вопросы: «Есть ли такой же размер XL?», «Эта ткань подходит для дождя?», «Можно ли примерить другой цвет?» Продавец получает конкретный запрос и может предложить варианты. Покупатель выбирает осознанно, а магазин получает шанс довести заинтересованность до покупки."
      ],
      [
        "Пример 2. Техника, в которой важны детали",
        "Человек ищет зарядное устройство или наушники. Внешне товары похожи, но нужно уточнить совместимость с моделью телефона, комплектацию и условия гарантии. Из-за языка покупатель может бояться ошибиться и отказаться от покупки, хотя нужный товар уже лежит перед ним.",
        "В разговоре через ESX можно написать модель устройства, спросить: «Подходит ли этот разъём?» и «Что входит в комплект?» Сотруднику легче понять задачу, чем угадывать её по жестам. Перед оплатой покупатель и продавец могут ещё раз сверить модель, цену и условия — особенно когда от одной детали зависит правильный выбор."
      ],
      [
        "Пример 3. Запись на стрижку или другую услугу",
        "Иностранный клиент хочет записаться в салон, но не знает, как объяснить желаемую длину, спросить о свободном времени и понять, что входит в цену. Похожая ситуация возникает в мастерской или сервисном центре: человеку важно заранее описать задачу, а специалисту — уточнить объём работы.",
        "В чате можно обсудить удобное время, пожелания, ориентировочную стоимость и продолжительность. Например: «Хочу укоротить волосы на три сантиметра», «Входит ли укладка?» или «Сначала сообщите стоимость ремонта». Так обе стороны начинают с более ясных ожиданий, а не с предположений."
      ],
      [
        "Пример 4. Кафе и гостиница: небольшие вопросы меняют впечатление",
        "В кафе посетитель хочет узнать, насколько острое блюдо, можно ли убрать отдельный ингредиент и заказать еду с собой. В гостинице гостю нужно уточнить время завтрака, возможность оставить багаж или условия позднего выезда. Эти вопросы кажутся простыми, пока не приходится задавать их на незнакомом языке.",
        "ESX даёт пространство для спокойного обмена сообщениями. Гость может сформулировать запрос, а сотрудник — ответить и уточнить детали. В вопросах состава еды, ограничений и дополнительных платежей важно получить явное подтверждение от сотрудника: понятный разговор помогает сверить условия, но не заменяет проверку."
      ],
      [
        "Пример 5. Лыжи напрокат в горах",
        "Человек приехал на курорт и хочет взять лыжи, но не знает, как объяснить размер обуви, свой опыт и желаемое время аренды. В чате он может спросить: «Мне нужен комплект на два часа. Ботинки и шлем входят в стоимость?»",
        "Сотрудник уточняет запрос, помогает подобрать снаряжение и объясняет время возврата, залог и оплату. Посетителю проще разобраться в предложении, а прокату — обслужить иностранного клиента."
      ],
      [
        "Пример 6. Доска для катания у моря",
        "На пляже отдыхающий хочет арендовать доску, но не понимает, какая подходит для его опыта и сколько стоит прокат. Через ESX можно уточнить: «Я начинающий. Какую доску вы предлагаете? Можно ли взять урок?»",
        "В переписке удобно обсудить длительность аренды, комплект, залог и место возврата. Сотрудник или инструктор объясняет условия и правила на месте, а клиент может задать дополнительные вопросы до оплаты."
      ],
      [
        "Что это даёт бизнесу",
        "Языковой барьер может скрывать спрос: рядом есть люди, которым нужен товар или услуга, но они не обращаются, потому что не знают, как начать. Доступный способ общения помогает бизнесу заметить эти запросы, объяснить предложение и обслужить аудиторию, с которой раньше было трудно договориться.",
        "Мы видим в этом возможность для большего числа обращений, покупок и повторных визитов. Это цель сервиса, а не обещание гарантированного роста выручки: результат зависит и от товара, цены, качества обслуживания и других условий. ESX помогает на важном этапе — когда человеку нужно быть понятым, а бизнесу нужно понять его потребность."
      ],
      [
        "Один QR-код — начало понятного разговора",
        "Сценарий простой: откройте чат ESX, покажите собеседнику QR-код, выберите свой язык общения и начните обмениваться сообщениями. Лучше задавать вопросы по одному и писать конкретно: название товара, размер, модель, время или желаемую услугу. Так проще заметить недопонимание и уточнить ответ.",
        "Мы создаём ESX для людей, которые хотят увереннее чувствовать себя в другой языковой среде, и для компаний, которые хотят быть ближе к своим клиентам. Наша идея — больше повседневной самостоятельности, больше понятных разговоров и больше возможностей встретиться тем, кто ищет, и тем, кто может предложить."
      ]
    ]
  },
  "en": {
    "title": "When a conversation creates an opportunity",
    "intro": "Imagine an ordinary day in another country: you need a jacket, a phone repair, a haircut or information about your hotel. You are ready to pay, but unsure that you will be understood. We build ESX for these everyday situations, helping people approach businesses and businesses understand their customers.",
    "sections": [
      [
        "The barrier starts before the first question",
        "A shopper may walk past a store because they worry about explaining a size or understanding a fast reply. The business never discovers that someone was interested.",
        "Comfortable communication means more than finding a shop or restroom. It helps people compare options, ask about conditions and make their own decisions."
      ],
      [
        "Example 1. Choosing clothes",
        "A customer likes a jacket but needs a larger size, another color or information about the fabric. Gestures may leave these details unclear.",
        "In chat they can ask: “Do you have XL?”, “Is it suitable for rain?” and “May I try another color?” Clear requests help the seller suggest options and the buyer decide."
      ],
      [
        "Example 2. Buying electronics",
        "Chargers or headphones may look similar, yet compatibility and what is included matter. A customer may leave rather than risk choosing incorrectly.",
        "They can type the device model and ask about the connector, contents and warranty terms. Before paying, both sides can confirm the model, price and conditions."
      ],
      [
        "Example 3. Booking a service",
        "Someone wants a haircut but cannot explain the length, ask for an appointment or understand the price. Repair services raise similar questions.",
        "Messages let them discuss timing, preferences, estimated cost and duration: “Only three centimeters, please” or “Tell me the repair price first.” Both sides gain clearer expectations."
      ],
      [
        "Example 4. Cafés and hotels",
        "A café guest may ask about spice levels, ingredients or takeaway. A hotel guest may need breakfast times, luggage storage or late checkout conditions.",
        "Chat provides time to phrase a request and clarify the answer. Ingredients, restrictions and extra charges should still be explicitly confirmed with staff."
      ],
      [
        "Example 5. Renting skis in the mountains",
        "A visitor wants skis but needs to explain boot size, experience and rental duration. In chat they can ask: “I need a set for two hours. Are boots and a helmet included?”",
        "Staff can clarify the request, help choose equipment and explain returns, deposits and payment. The visitor understands the offer and the rental business can serve an international customer."
      ],
      [
        "Example 6. Renting a board by the sea",
        "A beach visitor wants a board but is unsure which suits their experience or what rental costs. They can ask through ESX: “I’m a beginner. Which board do you suggest? Can I book a lesson?”",
        "Messages help clarify duration, included equipment, deposit and return location. Staff or an instructor explain local conditions and rules, while the customer asks questions before paying."
      ],
      [
        "Opportunities for businesses",
        "Language barriers can hide demand. An accessible conversation helps a business understand enquiries, explain its offer and serve international customers.",
        "More enquiries, purchases and return visits are our aim, not a guaranteed revenue increase. Results also depend on products, pricing and service. ESX supports the moment when understanding matters."
      ],
      [
        "Start with a QR code",
        "Open an ESX chat, show the other person its QR code, choose your conversation language and exchange messages. Ask one specific question at a time.",
        "We want everyday life to feel more independent and businesses to feel more approachable: more understandable conversations and more chances for needs and offers to meet."
      ]
    ]
  },
  "ko": {
    "title": "대화가 기회가 되는 순간",
    "intro": "낯선 나라에서 재킷을 사고, 휴대전화를 수리하고, 미용실을 예약하는 하루를 떠올려 보세요. 이용할 의향은 있지만 말이 통할지 걱정됩니다. ESX는 이런 일상의 상황에서 사람과 사업자가 대화를 시작하도록 돕기 위해 만들어집니다.",
    "sections": [
      [
        "첫 질문 전부터 생기는 장벽",
        "손님은 사이즈를 설명하거나 빠른 답변을 이해하지 못할까 봐 가게 앞을 지나칠 수 있습니다. 가게는 관심 있는 손님이 있었다는 사실조차 모릅니다.",
        "편안한 소통은 가게나 화장실 위치를 묻는 것 이상입니다. 선택지를 비교하고 조건을 확인하며 스스로 결정할 수 있게 합니다."
      ],
      [
        "사례 1. 옷 고르기",
        "재킷이 마음에 들지만 더 큰 사이즈나 다른 색상, 소재가 궁금합니다. 몸짓만으로는 세부 사항이 전달되지 않을 수 있습니다.",
        "채팅으로 ‘XL 사이즈가 있나요?’, ‘비 오는 날 입기 좋은가요?’, ‘다른 색을 입어 봐도 되나요?’라고 물을 수 있습니다. 판매자는 요청에 맞는 선택지를 제안합니다."
      ],
      [
        "사례 2. 전자제품 구매",
        "충전기나 이어폰은 비슷해 보여도 호환성과 구성품이 중요합니다. 잘못 살까 봐 구매를 포기할 수도 있습니다.",
        "기기 모델을 적고 단자, 구성품, 보증 조건을 물어볼 수 있습니다. 결제 전에 모델과 가격, 조건을 함께 확인하면 선택에 도움이 됩니다."
      ],
      [
        "사례 3. 서비스 예약",
        "머리 길이를 설명하거나 예약 시간과 가격을 묻기 어려울 수 있습니다. 수리점에서도 작업 범위를 미리 설명해야 합니다.",
        "‘3센티미터만 잘라 주세요’, ‘수리 전에 비용을 알려 주세요’처럼 희망 사항과 시간, 예상 비용을 대화로 확인하면 서로의 기대가 명확해집니다."
      ],
      [
        "사례 4. 카페와 호텔",
        "카페에서는 맵기, 재료, 포장을 묻고 호텔에서는 조식 시간, 짐 보관, 늦은 퇴실 조건을 확인할 수 있습니다.",
        "메시지로 요청을 정리하고 답변을 확인할 여유가 생깁니다. 재료나 제한 사항, 추가 요금은 직원에게 명확히 확인하는 것이 중요합니다."
      ],
      [
        "사례 5. 산에서 스키 빌리기",
        "방문객은 부츠 사이즈, 경험, 대여 시간을 설명해야 합니다. 채팅으로 ‘두 시간 동안 빌리고 싶어요. 부츠와 헬멧도 포함되나요?’라고 물을 수 있습니다.",
        "직원은 요청을 확인하고 장비 선택을 도우며 반납 시간, 보증금, 결제 조건을 설명합니다. 방문객은 조건을 이해하고 대여점은 외국인 고객을 응대할 수 있습니다."
      ],
      [
        "사례 6. 바닷가에서 보드 빌리기",
        "보드를 빌리고 싶지만 자신의 경험에 맞는 종류와 요금을 모를 수 있습니다. ESX로 ‘초보자에게 어떤 보드를 추천하나요? 강습도 받을 수 있나요?’라고 질문할 수 있습니다.",
        "대여 시간, 포함 장비, 보증금과 반납 장소를 대화로 확인합니다. 직원이나 강사가 현장 조건과 규칙을 설명하고 고객은 결제 전에 더 물어볼 수 있습니다."
      ],
      [
        "사업자에게 생기는 기회",
        "언어 장벽 뒤에는 드러나지 않은 수요가 있을 수 있습니다. 쉬운 대화 방식은 문의를 파악하고 제안을 설명하며 외국인 고객을 응대하는 데 도움이 됩니다.",
        "문의와 구매, 재방문 기회를 넓히는 것이 목표이며 매출 증가를 보장하는 것은 아닙니다. 상품, 가격, 서비스도 영향을 줍니다. ESX는 서로의 필요를 이해하는 순간을 돕습니다."
      ],
      [
        "QR코드로 시작하기",
        "ESX 채팅을 열고 상대에게 QR코드를 보여 준 뒤 대화 언어를 선택하세요. 모델, 사이즈, 시간처럼 구체적인 정보를 담아 한 번에 하나씩 질문해 보세요.",
        "더 주도적인 일상과 더 가까운 사업자, 더 많은 이해 가능한 대화가 우리의 목표입니다. 필요한 사람과 제공할 수 있는 사람이 쉽게 만날 수 있기를 바랍니다."
      ]
    ]
  },
  "zh": {
    "title": "当对话成为机会",
    "intro": "在陌生的国家，你想买外套、修手机、预约理发或咨询酒店。你愿意消费，却担心对方听不懂。ESX正是为这些日常场景而创建，帮助顾客迈出第一步，也帮助商家理解需求。",
    "sections": [
      [
        "障碍始于开口之前",
        "顾客可能担心不会询问尺码、听不懂回答，于是从店门前走过。商家甚至不知道曾有一位潜在顾客。",
        "轻松交流不只是问商店或洗手间在哪里，更意味着能够比较选择、确认条件并独立做决定。"
      ],
      [
        "例一：购买衣服",
        "顾客喜欢一件外套，却想问更大的尺码、其他颜色或面料情况。手势未必能说明这些细节。",
        "在聊天中可以问：‘有XL吗？’‘适合下雨时穿吗？’‘能试另一种颜色吗？’明确的需求让店员更容易推荐。"
      ],
      [
        "例二：选购电子产品",
        "充电器或耳机看起来相似，但兼容性和配件很重要。顾客可能因为怕买错而离开。",
        "写下设备型号，询问接口、包装内容和保修条件。付款前再次核对型号、价格与条件，有助于做出合适的选择。"
      ],
      [
        "例三：预约服务",
        "顾客想理发，却不会说明长度、询问时间和价格。维修服务也需要先明确工作范围。",
        "通过消息讨论需求、时间、预计费用与时长，例如‘只剪三厘米’或‘维修前先告知价格’，双方能形成更清晰的预期。"
      ],
      [
        "例四：咖啡馆与酒店",
        "在餐厅可以问辣度、食材和打包；在酒店可以问早餐、寄存行李和延迟退房条件。",
        "聊天让人有时间组织请求并确认回答。食材、限制事项和额外费用仍应与工作人员明确核实。"
      ],
      [
        "例五：在山上租滑雪装备",
        "游客需要说明鞋码、经验和租用时长。聊天时可以问：‘我想租两小时，费用包含雪鞋和头盔吗？’",
        "工作人员可以确认需求，帮助选择装备，并说明归还时间、押金与付款条件。游客更容易理解，租赁商也能接待外国顾客。"
      ],
      [
        "例六：在海边租冲浪板",
        "游客想租板，却不了解适合自己的类型与费用。通过ESX可以问：‘我是初学者，推荐哪种板？可以预约课程吗？’",
        "消息交流便于确认时长、配套装备、押金和归还地点。工作人员或教练讲解现场条件与规则，顾客可以在付款前继续提问。"
      ],
      [
        "商家的机会",
        "语言障碍可能掩盖真实需求。便捷的交流方式帮助商家了解咨询、介绍产品并接待外国顾客。",
        "增加咨询、购买和回访机会是我们的目标，并非营收增长保证。商品、价格与服务同样重要。ESX帮助双方先理解彼此。"
      ],
      [
        "从二维码开始",
        "打开ESX聊天，向对方展示二维码，选择交流语言并发送消息。每次问一个具体问题，写清型号、尺码或时间。",
        "我们希望人们生活得更自主，商家更容易接近，让有需求的人与能够提供服务的人更顺畅地相遇。"
      ]
    ]
  },
  "tr": {
    "title": "Bir konuşma fırsata dönüştüğünde",
    "intro": "Başka bir ülkede ceket almak, telefon tamir ettirmek veya kuaför randevusu almak istediğinizi düşünün. Ödemeye hazırsınız ama anlaşılacağınızdan emin değilsiniz. ESX bu gündelik durumlarda müşteriyle işletmenin konuşmaya başlamasına yardımcı olur.",
    "sections": [
      [
        "Engel ilk sorudan önce başlar",
        "Müşteri bedenini anlatamamaktan veya hızlı bir cevabı anlayamamaktan çekinip mağazayı geçebilir. İşletme bu ilgiden haberdar bile olmaz.",
        "Rahat iletişim mağaza veya tuvalet sormaktan fazlasıdır: seçenekleri karşılaştırmak, koşulları öğrenmek ve bağımsız karar vermektir."
      ],
      [
        "Örnek 1. Kıyafet seçmek",
        "Müşteri ceketi beğenir ama büyük beden, başka renk veya kumaş hakkında bilgi ister. İşaretler her ayrıntıyı anlatmayabilir.",
        "Sohbette ‘XL var mı?’, ‘Yağmura uygun mu?’ veya ‘Başka renk deneyebilir miyim?’ diye sorabilir. Satıcı somut ihtiyaca göre seçenek sunar."
      ],
      [
        "Örnek 2. Elektronik almak",
        "Şarj aletleri ve kulaklıklar benzer görünse de uyumluluk ve kutu içeriği önemlidir. Yanlış ürün korkusu alışverişi engelleyebilir.",
        "Cihaz modelini yazıp bağlantıyı, içeriği ve garanti koşullarını sorabilirsiniz. Ödeme öncesinde model, fiyat ve koşullar yeniden doğrulanabilir."
      ],
      [
        "Örnek 3. Hizmet randevusu",
        "Saç uzunluğunu anlatmak, uygun zamanı ve fiyatı öğrenmek zor olabilir. Tamirde de işin kapsamı önceden açıklanmalıdır.",
        "‘Yalnızca üç santimetre kesin’ veya ‘Önce tamir ücretini söyleyin’ gibi mesajlarla istek, süre ve tahmini ücret konuşulur. Beklentiler netleşir."
      ],
      [
        "Örnek 4. Kafe ve otel",
        "Kafede acılık, içerik veya paket servis; otelde kahvaltı, bagaj bırakma veya geç çıkış koşulları sorulabilir.",
        "Mesajlaşma isteği düşünerek yazmaya ve cevabı açıklığa kavuşturmaya yardımcı olur. İçerikler, kısıtlamalar ve ek ücretler personelle açıkça doğrulanmalıdır."
      ],
      [
        "Örnek 5. Dağda kayak kiralamak",
        "Ziyaretçinin bot numarasını, deneyimini ve kiralama süresini anlatması gerekir. ‘İki saatlik takım istiyorum. Bot ve kask dahil mi?’ diye sorabilir.",
        "Görevli ekipman seçiminde yardımcı olur; iade saatini, depozitoyu ve ödeme koşullarını açıklar. Ziyaretçi teklifi daha iyi anlar."
      ],
      [
        "Örnek 6. Deniz kenarında sörf tahtası",
        "Ziyaretçi hangi tahtanın deneyimine uygun olduğunu ve ücreti merak eder. ESX üzerinden ‘Yeni başlıyorum. Hangisini önerirsiniz? Ders alabilir miyim?’ diye sorabilir.",
        "Süre, ekipman, depozito ve iade yeri mesajlarla netleştirilir. Görevli veya eğitmen yerel koşulları ve kuralları açıklar; müşteri ödeme öncesinde sorularını sorar."
      ],
      [
        "İşletmeler için fırsatlar",
        "Dil engeli talebi görünmez kılabilir. Kolay bir iletişim yolu işletmenin ihtiyacı anlamasını ve yabancı müşterilere hizmet vermesini destekler.",
        "Daha fazla başvuru, alışveriş ve tekrar ziyaret hedefimizdir; gelir artışı garantisi değildir. Ürün, fiyat ve hizmet de sonucu etkiler."
      ],
      [
        "QR kodla başlayın",
        "ESX sohbetini açın, QR kodunu gösterin ve iletişim dilinizi seçin. Model, beden veya saat gibi ayrıntıları yazarak soruları tek tek sorun.",
        "Daha bağımsız bir günlük yaşam ve daha erişilebilir işletmeler istiyoruz. İhtiyaçlarla teklifleri anlaşılır konuşmalar aracılığıyla buluşturuyoruz."
      ]
    ]
  },
  "vi": {
    "title": "Khi cuộc trò chuyện mở ra cơ hội",
    "intro": "Ở một đất nước mới, bạn muốn mua áo, sửa điện thoại hay đặt lịch cắt tóc. Bạn sẵn sàng chi trả nhưng lo người khác không hiểu mình. ESX hỗ trợ những tình huống hằng ngày ấy, giúp khách hàng và doanh nghiệp bắt đầu trao đổi.",
    "sections": [
      [
        "Rào cản có trước câu hỏi đầu tiên",
        "Khách có thể đi ngang cửa hàng vì sợ không hỏi được kích cỡ hoặc không hiểu câu trả lời nhanh. Người bán thậm chí không biết có khách quan tâm.",
        "Giao tiếp thuận tiện không chỉ để hỏi cửa hàng hay nhà vệ sinh, mà còn để so sánh lựa chọn, xác nhận điều kiện và tự quyết định."
      ],
      [
        "Ví dụ 1. Mua quần áo",
        "Khách thích áo khoác nhưng muốn cỡ lớn hơn, màu khác hoặc biết chất liệu. Cử chỉ chưa chắc truyền đạt đủ.",
        "Trong chat có thể hỏi ‘Có XL không?’, ‘Mặc lúc mưa được không?’ hoặc ‘Tôi thử màu khác được chứ?’. Người bán dễ đề xuất đúng nhu cầu hơn."
      ],
      [
        "Ví dụ 2. Mua thiết bị điện tử",
        "Sạc và tai nghe có vẻ giống nhau nhưng tính tương thích và phụ kiện rất quan trọng. Sợ chọn sai có thể khiến khách bỏ mua.",
        "Khách ghi mẫu thiết bị, hỏi đầu nối, phụ kiện và điều kiện bảo hành. Trước khi trả tiền, hai bên có thể xác nhận lại mẫu, giá và điều kiện."
      ],
      [
        "Ví dụ 3. Đặt dịch vụ",
        "Khách khó giải thích độ dài tóc, hỏi lịch trống hay giá. Dịch vụ sửa chữa cũng cần làm rõ phạm vi công việc.",
        "Tin nhắn như ‘Chỉ cắt ba centimét’ hoặc ‘Báo giá sửa trước’ giúp trao đổi mong muốn, thời gian và chi phí dự kiến rõ ràng."
      ],
      [
        "Ví dụ 4. Quán ăn và khách sạn",
        "Khách hỏi độ cay, nguyên liệu, mang đi; tại khách sạn hỏi giờ ăn sáng, gửi hành lý hoặc trả phòng muộn.",
        "Chat cho thời gian diễn đạt và làm rõ câu trả lời. Thành phần, hạn chế và phụ phí vẫn cần được nhân viên xác nhận cụ thể."
      ],
      [
        "Ví dụ 5. Thuê ván trượt tuyết",
        "Khách cần nói cỡ giày, kinh nghiệm và thời gian thuê. Trong chat có thể hỏi: ‘Tôi muốn thuê hai giờ. Đã gồm giày và mũ bảo hiểm chưa?’",
        "Nhân viên giúp chọn thiết bị, giải thích giờ trả, tiền cọc và thanh toán. Khách hiểu điều kiện hơn, cửa hàng dễ phục vụ khách nước ngoài."
      ],
      [
        "Ví dụ 6. Thuê ván ở biển",
        "Khách muốn thuê ván nhưng chưa biết loại phù hợp và giá. Qua ESX có thể hỏi: ‘Tôi mới bắt đầu, nên chọn ván nào? Có thể học một buổi không?’",
        "Tin nhắn giúp làm rõ thời lượng, thiết bị đi kèm, tiền cọc và nơi trả. Nhân viên hoặc hướng dẫn viên giải thích điều kiện và quy tắc tại chỗ trước khi khách thanh toán."
      ],
      [
        "Cơ hội cho doanh nghiệp",
        "Rào cản ngôn ngữ có thể che khuất nhu cầu. Cách giao tiếp dễ tiếp cận giúp hiểu yêu cầu, giới thiệu sản phẩm và phục vụ khách nước ngoài.",
        "Nhiều yêu cầu, giao dịch và lượt quay lại hơn là mục tiêu, không phải bảo đảm doanh thu tăng. Sản phẩm, giá và dịch vụ cũng quyết định kết quả."
      ],
      [
        "Bắt đầu bằng mã QR",
        "Mở chat ESX, đưa mã QR cho đối phương và chọn ngôn ngữ. Hỏi từng câu cụ thể, ghi rõ mẫu, kích cỡ hoặc thời gian.",
        "Chúng tôi muốn mọi người chủ động hơn trong cuộc sống, doanh nghiệp gần khách hơn, và nhu cầu gặp được người có thể đáp ứng."
      ]
    ]
  },
  "km": {
    "title": "ពេលការសន្ទនាបង្កើតឱកាស",
    "intro": "នៅប្រទេសថ្មី អ្នកចង់ទិញអាវ ជួសជុលទូរស័ព្ទ ឬកក់កាត់សក់។ អ្នកមានបំណងចំណាយ ប៉ុន្តែបារម្ភថាគេមិនយល់។ ESX ជួយអតិថិជន និងអាជីវកម្មចាប់ផ្តើមសន្ទនាក្នុងស្ថានភាពប្រចាំថ្ងៃទាំងនេះ។",
    "sections": [
      [
        "ឧបសគ្គមុនសំណួរដំបូង",
        "អតិថិជនអាចដើរហួសហាង ព្រោះខ្លាចសួរទំហំមិនបាន ឬស្តាប់ចម្លើយមិនយល់។ អ្នកលក់មិនដឹងថាមានអ្នកចាប់អារម្មណ៍ទេ។",
        "ការសន្ទនាងាយមិនត្រឹមតែសួរទីតាំងហាង ឬបង្គន់ទេ ប៉ុន្តែជួយប្រៀបធៀបជម្រើស និងសម្រេចចិត្តដោយខ្លួនឯង។"
      ],
      [
        "ឧទាហរណ៍ ១៖ ទិញសម្លៀកបំពាក់",
        "អតិថិជនចូលចិត្តអាវ តែចង់បានទំហំធំ ពណ៌ផ្សេង ឬព័ត៌មានក្រណាត់។ កាយវិការមិនប្រាកដថាច្បាស់ទេ។",
        "ក្នុងការជជែក អាចសួរ ‘មាន XL ទេ?’ ឬ ‘សាកពណ៌ផ្សេងបានទេ?’។ អ្នកលក់អាចណែនាំតាមតម្រូវការច្បាស់។"
      ],
      [
        "ឧទាហរណ៍ ២៖ ទិញឧបករណ៍",
        "ឆ្នាំងសាក និងកាសអាចមើលទៅស្រដៀង ប៉ុន្តែភាពត្រូវគ្នាជាមួយឧបករណ៍ និងគ្រឿងបន្ថែមសំខាន់។",
        "អ្នកអាចសរសេរម៉ូដែល សួររន្ធភ្ជាប់ គ្រឿងក្នុងប្រអប់ និងការធានា។ មុនបង់ប្រាក់ គួរបញ្ជាក់ម៉ូដែល តម្លៃ និងលក្ខខណ្ឌម្ដងទៀត។"
      ],
      [
        "ឧទាហរណ៍ ៣៖ កក់សេវា",
        "ការពន្យល់ប្រវែងសក់ ពេលទំនេរ ឬតម្លៃអាចពិបាក។ ការជួសជុលក៏ត្រូវពន្យល់ការងារជាមុន។",
        "សារដូចជា ‘កាត់តែបីសង់ទីម៉ែត្រ’ ឬ ‘ប្រាប់តម្លៃជួសជុលមុន’ ជួយឱ្យការរំពឹងទុករបស់ភាគីទាំងពីរច្បាស់។"
      ],
      [
        "ឧទាហរណ៍ ៤៖ ហាងអាហារ និងសណ្ឋាគារ",
        "ភ្ញៀវអាចសួរអំពីភាពហឹរ គ្រឿងផ្សំ ការវេចខ្ចប់ ឬម៉ោងអាហារព្រឹក ការផ្ញើអីវ៉ាន់ និងការចេញយឺត។",
        "សារផ្តល់ពេលគិត និងសួរបញ្ជាក់។ គ្រឿងផ្សំ ការកំណត់ និងថ្លៃបន្ថែមត្រូវបញ្ជាក់ច្បាស់ជាមួយបុគ្គលិក។"
      ],
      [
        "ឧទាហរណ៍ ៥៖ ជួលស្គីនៅភ្នំ",
        "ភ្ញៀវត្រូវពន្យល់ទំហំស្បែកជើង បទពិសោធន៍ និងរយៈពេលជួល។ អាចសួរថា ‘ខ្ញុំចង់ជួលពីរម៉ោង។ មានស្បែកជើង និងមួកសុវត្ថិភាពរួមទេ?’។",
        "បុគ្គលិកជួយជ្រើសឧបករណ៍ ហើយពន្យល់ម៉ោងប្រគល់វិញ ប្រាក់កក់ និងការបង់ប្រាក់។ ភ្ញៀវអាចយល់លក្ខខណ្ឌបានច្បាស់។"
      ],
      [
        "ឧទាហរណ៍ ៦៖ ជួលក្តារជិះរលកនៅសមុទ្រ",
        "ភ្ញៀវចង់ជួលក្តារ តែមិនដឹងប្រភេទសមនឹងបទពិសោធន៍ និងតម្លៃ។ អាចសួរតាម ESX ថា ‘ខ្ញុំទើបចាប់ផ្តើម។ តើក្តារណាសម? អាចរៀនបានទេ?’។",
        "សារជួយបញ្ជាក់រយៈពេល ឧបករណ៍ ប្រាក់កក់ និងទីតាំងប្រគល់វិញ។ បុគ្គលិក ឬគ្រូពន្យល់លក្ខខណ្ឌ និងច្បាប់នៅទីនោះ មុនអតិថិជនបង់ប្រាក់។"
      ],
      [
        "ឱកាសសម្រាប់អាជីវកម្ម",
        "ភាសាអាចលាក់តម្រូវការអតិថិជន។ មធ្យោបាយសន្ទនាងាយជួយយល់សំណើ និងបម្រើអតិថិជនបរទេស។",
        "ការសាកសួរ ការទិញ និងការត្រឡប់មកវិញកាន់តែច្រើនជាគោលដៅ មិនមែនការធានាប្រាក់ចំណូលទេ។ ទំនិញ តម្លៃ និងសេវាក៏មានឥទ្ធិពល។"
      ],
      [
        "ចាប់ផ្តើមដោយ QR",
        "បើកការជជែក ESX បង្ហាញ QR និងជ្រើសភាសា។ សួរម្តងមួយសំណួរ ដោយបញ្ជាក់ម៉ូដែល ទំហំ ឬពេលវេលា។",
        "យើងចង់ឱ្យជីវិតកាន់តែឯករាជ្យ និងអាជីវកម្មជិតអតិថិជន ដើម្បីឱ្យអ្នកត្រូវការ និងអ្នកផ្តល់ជួបគ្នាបានងាយ។"
      ]
    ]
  },
  "kk": {
    "title": "Әңгіме мүмкіндікке айналғанда",
    "intro": "Бөтен елде күрте сатып алу, телефон жөндету немесе шаш қиюға жазылу керек делік. Ақшаңыз да, ниетіңіз де бар, бірақ сізді түсінетініне сенім жоқ. ESX осындай күнделікті жағдайда клиент пен бизнеске сөйлесуді бастауға көмектеседі.",
    "sections": [
      [
        "Кедергі алғашқы сұрақтан бұрын басталады",
        "Клиент өлшемін түсіндіре алмаймын немесе жауапты ұқпаймын деп дүкеннен өтіп кетуі мүмкін. Сатушы қызығушылық болғанын білмейді.",
        "Ыңғайлы қарым-қатынас дүкен не дәретхана сұраудан кеңірек: нұсқаларды салыстыру, шарттарды білу және өз бетінше шешім қабылдау."
      ],
      [
        "1-мысал. Киім таңдау",
        "Күрте ұнады, бірақ үлкен өлшем, басқа түс немесе мата туралы мәлімет керек. Ыммен бәрін түсіндіру қиын.",
        "Чатта ‘XL бар ма?’, ‘Жаңбырға жарай ма?’, ‘Басқа түсті киіп көрсем бола ма?’ деп сұрауға болады. Сатушы нақты қажеттілікке сай нұсқа ұсынады."
      ],
      [
        "2-мысал. Техника сатып алу",
        "Қуаттағыштар мен құлаққаптар ұқсас болғанымен, үйлесімділігі мен жиынтығы маңызды. Қателесуден қорқу сатып алуға кедергі болады.",
        "Құрылғы моделін жазып, қосқыш, жиынтық пен кепілдік шарттарын сұрауға болады. Төлем алдында модель, баға және шарттарды қайта нақтылаған жөн."
      ],
      [
        "3-мысал. Қызметке жазылу",
        "Шаш ұзындығын түсіндіру, бос уақыт пен бағаны сұрау қиын болуы мүмкін. Жөндеуде де жұмыс ауқымын анықтау керек.",
        "‘Үш сантиметр ғана қиыңыз’ немесе ‘Алдымен жөндеу бағасын айтыңыз’ деген хабарламалар ниетті, уақыт пен болжамды шығынды нақтылауға көмектеседі."
      ],
      [
        "4-мысал. Кафе мен қонақүй",
        "Кафеде ащылық, құрам мен алып кетуді, қонақүйде таңғы ас, жүк сақтау және кеш шығу шарттарын сұрауға болады.",
        "Чат сұрақты ойластырып, жауапты нақтылауға уақыт береді. Құрам, шектеулер мен қосымша төлемдерді қызметкермен анық растау қажет."
      ],
      [
        "5-мысал. Тауда шаңғы жалдау",
        "Демалушы аяқкиім өлшемін, тәжірибесін және жалдау уақытын түсіндіруі керек. ‘Екі сағатқа жиынтық керек. Аяқкиім мен дулыға бағаға кіре ме?’ деп сұрай алады.",
        "Қызметкер жабдықты таңдауға көмектесіп, қайтару уақытын, кепілақы мен төлемді түсіндіреді. Клиент шарттарды жақсырақ ұғады."
      ],
      [
        "6-мысал. Теңізде тақта жалдау",
        "Демалушы қай тақта тәжірибесіне сай келетінін және бағасын білмейді. ESX арқылы ‘Мен жаңадан бастадым. Қайсысын ұсынасыз? Сабақ алуға бола ма?’ деп сұрай алады.",
        "Чатта мерзім, жабдық, кепілақы мен қайтару орнын нақтылауға болады. Қызметкер немесе нұсқаушы жергілікті жағдай мен ережелерді түсіндіреді, клиент төлемге дейін сұрақ қояды."
      ],
      [
        "Бизнеске мүмкіндік",
        "Тілдік кедергі сұранысты жасыруы мүмкін. Оңай сөйлесу тәсілі өтінішті түсінуге, ұсынысты таныстыруға және шетелдік клиенттерге қызмет көрсетуге көмектеседі.",
        "Көбірек өтініш, сатып алу және қайта келу — мақсатымыз, табыс өсімінің кепілі емес. Тауар, баға мен қызмет те нәтижеге әсер етеді."
      ],
      [
        "QR-кодтан бастаңыз",
        "ESX чатын ашып, QR-кодты көрсетіңіз және сөйлесу тілін таңдаңыз. Модель, өлшем не уақытты нақты жазып, сұрақтарды бір-бірден қойыңыз.",
        "Адамдардың күнделікті өмірі дербес, бизнес клиентке жақын болғанын қалаймыз. Қажеттілігі бар адам мен оны өтей алатын адам түсінікті әңгімеде кездеседі."
      ]
    ]
  }
};

const illustrations = ['', 'clothing-red-hair', 'electronics', 'salon', 'hospitality', 'ski-rental', 'surf-rental', 'bicycle-rental'];

export default function AboutMissionArticle({ language }: { language: Language }) {
 const t = article[language];
 return <article id="esx-everyday-stories" className="korea-story" style={{ gridColumn: '1 / -1' }} aria-labelledby="esx-mission-title">
  <h2 id="esx-mission-title">{t.title}</h2><p>{t.intro}</p>
  <Image className="korea-story-art" src="/about/international-visitors-comic.webp" alt="" width={2172} height={724} sizes="(max-width: 760px) 100vw, 1264px" style={{ marginTop: 24 }} />
  {t.sections.map(([heading, ...paragraphs], index) => <section key={heading} style={{ marginTop: 32, maxWidth: 960 }}><h3 style={{ fontSize: 'clamp(20px, 2vw, 26px)', lineHeight: 1.35, marginBottom: 16 }}>{heading}</h3>{illustrations[index] && <Image className="korea-story-art" src={`/about/${illustrations[index]}-comic.webp`} alt={heading} width={2172} height={724} sizes="(max-width: 760px) 100vw, 960px" style={{ marginBottom: 22 }} />}{paragraphs.map((paragraph, i) => <p key={i} style={{ marginTop: i ? 14 : 0 }}>{paragraph}</p>)}</section>)}
 </article>;
}
