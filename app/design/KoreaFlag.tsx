import Image from 'next/image';
import { copy, type Language } from './content';

type FlagText = { title: string; intro: string; parts: [string, string][]; note: string };
const text: Record<Language, FlagText> = {
  ru: {
    title: 'Флаг Южной Кореи: что означает каждая деталь',
    intro: 'Тхэгыкки (태극기) — государственный флаг Республики Корея. На белом полотнище расположены красно-синий круг тхэгык и четыре чёрные триграммы. Вместе они выражают идею гармонии и взаимодействия сил природы.',
    parts: [
      ['Белый фон', 'Белый цвет означает свет, чистоту и мир. Это не просто свободное пространство: фон — самостоятельная часть символики флага.'],
      ['Красно-синий круг — тхэгык', 'Красная верхняя часть представляет ян, синяя нижняя — инь. Изогнутая граница соединяет их в единое целое: взаимодополняющие силы взаимодействуют, рождая изменения. Это не противопоставление добра и зла.'],
      ['건 · Кон (Geon) — небо', 'Слева вверху. Три сплошные линии. Эта триграмма обозначает небо.'],
      ['곤 · Кон (Gon) — земля', 'Справа внизу. Три прерывистые линии, каждая состоит из двух отрезков. Эта триграмма обозначает землю.'],
      ['감 · Кам — вода', 'Справа вверху. Средняя линия сплошная, две внешние — прерывистые. Эта триграмма обозначает воду.'],
      ['리 · Ри — огонь', 'Слева внизу. Две внешние линии сплошные, средняя — прерывистая. Эта триграмма обозначает огонь.'],
    ],
    note: 'Триграмма — знак из трёх линий: сплошная связана с ян, прерывистая — с инь. Углы указаны при взгляде на флаг спереди, как на изображении выше. Ниже знаки показаны горизонтально для удобства чтения; на самом флаге они наклонены.',
  },
  en: {
    title: 'South Korea’s flag: the meaning of every detail',
    intro: 'Taegeukgi (태극기) is the national flag of the Republic of Korea. Its white field, red-and-blue taegeuk and four black trigrams express harmony and the interaction of natural forces.',
    parts: [
      ['White background', 'White represents brightness, purity and peace. The background is itself a meaningful part of the design.'],
      ['Red-and-blue taegeuk', 'The upper red portion represents yang; the lower blue portion represents yin. Their curved boundary unites complementary forces whose interaction brings change, rather than depicting good against evil.'],
      ['건 · Geon — heaven', 'Upper left. Three solid lines represent heaven.'],
      ['곤 · Gon — earth', 'Lower right. Three broken lines, each made of two segments, represent earth.'],
      ['감 · Gam — water', 'Upper right. A solid middle line between two broken lines represents water.'],
      ['리 · Ri — fire', 'Lower left. A broken middle line between two solid lines represents fire.'],
    ],
    note: 'A trigram has three lines: solid lines are associated with yang, broken lines with yin. Positions refer to the front view shown above. The diagrams below are horizontal for clarity; the flag’s trigrams are tilted.',
  },
  ko: {
    title: '태극기: 각 요소에 담긴 뜻',
    intro: '태극기는 대한민국의 국기입니다. 흰 바탕, 빨강과 파랑의 태극, 네 모서리의 검은 사괘가 자연의 조화와 상호 작용을 나타냅니다.',
    parts: [
      ['흰 바탕', '흰색은 밝음과 순수, 평화를 뜻합니다. 단순히 비어 있는 공간이 아니라 국기의 의미를 이루는 요소입니다.'],
      ['빨강과 파랑의 태극', '위쪽의 빨강은 양, 아래쪽의 파랑은 음을 나타냅니다. 곡선으로 이어진 두 부분은 서로 보완하며 변화하는 힘의 조화를 뜻하며, 선과 악의 대립이 아닙니다.'],
      ['건 · 하늘', '왼쪽 위. 끊어지지 않은 세 선으로 하늘을 나타냅니다.'],
      ['곤 · 땅', '오른쪽 아래. 가운데가 끊어진 세 선으로 땅을 나타냅니다.'],
      ['감 · 물', '오른쪽 위. 가운데는 이어진 선, 바깥 두 선은 끊어진 선으로 물을 나타냅니다.'],
      ['리 · 불', '왼쪽 아래. 가운데는 끊어진 선, 바깥 두 선은 이어진 선으로 불을 나타냅니다.'],
    ],
    note: '괘는 세 선으로 이루어집니다. 이어진 선은 양, 끊어진 선은 음과 연결됩니다. 위치는 위 그림처럼 정면에서 보았을 때를 기준으로 합니다. 아래 도식은 읽기 쉽게 수평으로 표시했으며 실제 국기에서는 기울어져 있습니다.',
  },
  zh: {
    title: '韩国国旗：每个细节的含义',
    intro: '太极旗（태극기）是大韩民国的国旗。白色旗面、红蓝太极和四角的黑色卦象共同表达自然力量的互动与和谐。',
    parts: [
      ['白色旗面', '白色象征光明、纯洁与和平。旗面本身也是国旗象征意义的一部分。'],
      ['红蓝太极', '上方红色代表阳，下方蓝色代表阴。曲线将两种互补力量连为一体，表达它们的互动与变化，并非善恶对立。'],
      ['건 · 乾 — 天', '左上角。三条实线，象征天。'],
      ['곤 · 坤 — 地', '右下角。三条断线，每条分为两段，象征地。'],
      ['감 · 坎 — 水', '右上角。中间为实线，两侧为断线，象征水。'],
      ['리 · 离 — 火', '左下角。中间为断线，两侧为实线，象征火。'],
    ],
    note: '每个卦象由三条线组成：实线为阳，断线为阴。方位按上图正面观看时说明。下方示意图为方便阅读采用水平排列，国旗上的卦象则是倾斜的。',
  },
  tr: {
    title: 'Güney Kore bayrağı: her ayrıntının anlamı',
    intro: 'Taegeukgi (태극기), Kore Cumhuriyeti’nin bayrağıdır. Beyaz zemin, kırmızı-mavi taegeuk ve dört siyah trigram doğadaki güçlerin etkileşimini ve uyumunu anlatır.',
    parts: [
      ['Beyaz zemin', 'Beyaz; aydınlığı, saflığı ve barışı temsil eder. Zemin de tasarımın anlam taşıyan bir parçasıdır.'],
      ['Kırmızı-mavi taegeuk', 'Üstteki kırmızı yang, alttaki mavi yin anlamına gelir. Eğri sınır birbirini tamamlayan güçleri birleştirir; etkileşimleri değişim yaratır. Bu, iyi ile kötünün çatışması değildir.'],
      ['건 · Geon — gök', 'Sol üstte. Üç kesintisiz çizgi göğü temsil eder.'],
      ['곤 · Gon — yer', 'Sağ altta. Her biri iki parçalı üç kesik çizgi yeri temsil eder.'],
      ['감 · Gam — su', 'Sağ üstte. Ortadaki kesintisiz çizgi ve dıştaki iki kesik çizgi suyu temsil eder.'],
      ['리 · Ri — ateş', 'Sol altta. Ortadaki kesik çizgi ve dıştaki iki kesintisiz çizgi ateşi temsil eder.'],
    ],
    note: 'Trigram üç çizgiden oluşur: kesintisiz çizgi yang, kesik çizgi yin ile ilişkilidir. Konumlar yukarıdaki önden görünüme göredir. Aşağıdaki şemalar yataydır; bayrakta işaretler eğik durur.',
  },
  vi: {
    title: 'Quốc kỳ Hàn Quốc: ý nghĩa từng chi tiết',
    intro: 'Taegeukgi (태극기) là quốc kỳ Đại Hàn Dân Quốc. Nền trắng, vòng taegeuk đỏ-xanh và bốn quẻ màu đen thể hiện sự hài hòa và tương tác của các lực trong tự nhiên.',
    parts: [
      ['Nền trắng', 'Màu trắng tượng trưng cho sự sáng trong, thuần khiết và hòa bình. Nền cờ cũng là một thành phần mang ý nghĩa riêng.'],
      ['Vòng taegeuk đỏ-xanh', 'Phần đỏ phía trên biểu thị dương, phần xanh phía dưới biểu thị âm. Đường cong kết nối hai lực bổ sung cho nhau, tạo nên sự biến đổi; đây không phải đối lập thiện và ác.'],
      ['건 · Càn — trời', 'Góc trên bên trái. Ba nét liền tượng trưng cho trời.'],
      ['곤 · Khôn — đất', 'Góc dưới bên phải. Ba nét đứt, mỗi nét gồm hai đoạn, tượng trưng cho đất.'],
      ['감 · Khảm — nước', 'Góc trên bên phải. Nét giữa liền, hai nét ngoài đứt, tượng trưng cho nước.'],
      ['리 · Ly — lửa', 'Góc dưới bên trái. Nét giữa đứt, hai nét ngoài liền, tượng trưng cho lửa.'],
    ],
    note: 'Mỗi quẻ có ba nét: nét liền gắn với dương, nét đứt gắn với âm. Vị trí được tính khi nhìn chính diện như hình trên. Sơ đồ dưới trình bày ngang cho dễ đọc; trên cờ các quẻ được đặt nghiêng.',
  },
  km: {
    title: 'ទង់ជាតិកូរ៉េខាងត្បូង៖ អត្ថន័យនៃធាតុនីមួយៗ',
    intro: 'Taegeukgi (태극기) ជាទង់ជាតិនៃសាធារណរដ្ឋកូរ៉េ។ ផ្ទៃពណ៌ស រង្វង់ក្រហមនិងខៀវ និងសញ្ញាខ្មៅបួន បង្ហាញភាពសុខដុម និងអន្តរកម្មនៃកម្លាំងធម្មជាតិ។',
    parts: [
      ['ផ្ទៃពណ៌ស', 'ពណ៌សតំណាងឱ្យភាពភ្លឺថ្លា ភាពបរិសុទ្ធ និងសន្តិភាព។ ផ្ទៃទង់ក៏មានអត្ថន័យផ្ទាល់ខ្លួនដែរ។'],
      ['រង្វង់ក្រហមនិងខៀវ', 'ពណ៌ក្រហមខាងលើតំណាងឱ្យ yang ហើយពណ៌ខៀវខាងក្រោមតំណាងឱ្យ yin។ ខ្សែកោងភ្ជាប់កម្លាំងដែលបំពេញគ្នា និងបង្កើតការផ្លាស់ប្តូរ មិនមែនការប្រឆាំងរវាងល្អនិងអាក្រក់ទេ។'],
      ['건 · Geon — មេឃ', 'ជ្រុងខាងឆ្វេងលើ។ បន្ទាត់ជាប់គ្នាបីតំណាងឱ្យមេឃ។'],
      ['곤 · Gon — ផែនដី', 'ជ្រុងខាងស្តាំក្រោម។ បន្ទាត់ដាច់កណ្តាលបី ដែលនីមួយៗមានពីរផ្នែក តំណាងឱ្យផែនដី។'],
      ['감 · Gam — ទឹក', 'ជ្រុងខាងស្តាំលើ។ បន្ទាត់កណ្តាលជាប់ និងបន្ទាត់ខាងក្រៅពីរដាច់កណ្តាល តំណាងឱ្យទឹក។'],
      ['리 · Ri — ភ្លើង', 'ជ្រុងខាងឆ្វេងក្រោម។ បន្ទាត់កណ្តាលដាច់ និងបន្ទាត់ខាងក្រៅពីរជាប់ តំណាងឱ្យភ្លើង។'],
    ],
    note: 'សញ្ញានីមួយៗមានបីបន្ទាត់៖ បន្ទាត់ជាប់ទាក់ទងនឹង yang ហើយបន្ទាត់ដាច់ទាក់ទងនឹង yin។ ទីតាំងគិតពីការមើលទង់ពីមុខដូចរូបខាងលើ។ គំនូសខាងក្រោមដាក់ផ្តេកដើម្បីងាយអាន ប៉ុន្តែលើទង់ សញ្ញាទាំងនេះដាក់បញ្ឆិត។',
  },
  kk: {
    title: 'Оңтүстік Корея туы: әр бөлшектің мағынасы',
    intro: 'Тхэгыкки (태극기) — Корея Республикасының мемлекеттік туы. Ақ түс, қызыл-көк тхэгык шеңбері және төрт қара триграмма табиғат күштерінің өзара әрекеті мен үйлесімін білдіреді.',
    parts: [
      ['Ақ түс', 'Ақ түс жарықты, тазалықты және бейбітшілікті білдіреді. Тудың ақ аясы да жеке мағынаға ие.'],
      ['Қызыл-көк тхэгык', 'Жоғарғы қызыл бөлік — ян, төменгі көк бөлік — инь. Иілген шекара бірін-бірі толықтыратын күштерді біріктіреді. Олардың әрекеті өзгеріс туғызады; бұл жақсылық пен жамандықтың күресі емес.'],
      ['건 · Geon — аспан', 'Жоғарғы сол жақта. Үш тұтас сызық аспанды білдіреді.'],
      ['곤 · Gon — жер', 'Төменгі оң жақта. Әрқайсысы екі бөліктен тұратын үш үзік сызық жерді білдіреді.'],
      ['감 · Gam — су', 'Жоғарғы оң жақта. Ортаңғы сызық тұтас, сыртқы екеуі үзік: бұл — су.'],
      ['리 · Ri — от', 'Төменгі сол жақта. Ортаңғы сызық үзік, сыртқы екеуі тұтас: бұл — от.'],
    ],
    note: 'Триграмма үш сызықтан тұрады: тұтас сызық янмен, үзік сызық иньмен байланысты. Орындар жоғарыдағыдай алдынан қарағанда көрсетілген. Төмендегі сызбалар оқуға ыңғайлы болу үшін көлденең берілген; туда олар көлбеу орналасқан.',
  },
};

const history: Record<Language, [string, string][]> = {
  ru: [
    ['1882: зачем понадобился флаг', 'Создание тхэгыкки связано с выходом Кореи на международную дипломатическую арену. В 1882 году, при заключении договора с США, понадобился национальный флаг для представления страны. Точный вид флага на церемонии подписания достоверно не установлен.'],
    ['Кто участвовал в создании', 'По дневнику дипломата Пак Ён Хё, в сентябре 1882 года во время миссии в Японию он подготовил вариант с кругом тхэгык и четырьмя триграммами. Поэтому его связывают с формированием узнаваемого образа флага, но называть его единственным автором всех ранних вариантов было бы неточно.'],
    ['1883: официальное утверждение', '6 марта 1883 года король Коджон объявил тхэгыкки государственным флагом. Таким образом, 1882 год связан с появлением известного варианта, а 1883 — с официальным утверждением. После основания Республики Корея единые правила построения флага были опубликованы 15 октября 1949 года.'],
  ],
  en: [
    ['1882: why a flag was needed', 'The Taegeukgi emerged as Korea expanded international diplomacy. The 1882 treaty with the United States prompted the need for a national flag to represent the country. The exact flag used at the signing is not conclusively documented.'],
    ['Who helped create it', 'Diplomat Park Yeong-hyo recorded preparing a version with a taegeuk and four trigrams during his September 1882 mission to Japan. He is associated with its recognizable design, but should not be described as the sole creator of every early version.'],
    ['1883: official adoption', 'King Gojong proclaimed the Taegeukgi the national flag on March 6, 1883. Thus 1882 marks the familiar early design and 1883 its official adoption. After the Republic of Korea was established, standardized construction guidelines were announced on October 15, 1949.'],
  ],
  ko: [
    ['1882년: 국기가 필요해진 이유', '태극기의 탄생은 조선의 국제 외교 확대와 연결됩니다. 1882년 조미수호통상조약 체결을 계기로 국가를 대표할 국기가 필요해졌습니다. 조인식에서 사용된 국기의 정확한 모습은 확실하게 밝혀지지 않았습니다.'],
    ['제작에 참여한 인물', '박영효의 사화기략에 따르면 그는 1882년 9월 일본으로 가는 사행 중 태극과 사괘로 된 국기를 만들었습니다. 익숙한 형태의 태극기와 관련된 인물이지만 모든 초기 형태의 유일한 창안자로 단정하는 것은 정확하지 않습니다.'],
    ['1883년: 공식 국기로 제정', '고종은 1883년 3월 6일 태극기를 국기로 제정했습니다. 1882년은 알려진 초기 형태의 제작, 1883년은 공식 제정과 연결됩니다. 대한민국 수립 이후인 1949년 10월 15일에는 통일된 국기 제작법이 공포되었습니다.'],
  ],
  zh: [
    ['1882年：为什么需要国旗', '太极旗的诞生与朝鲜拓展国际外交有关。1882年与美国缔结条约时，需要一面代表国家的旗帜。签约仪式上所用旗帜的确切样式尚未得到确定。'],
    ['谁参与了设计', '据外交官朴泳孝的出使日记，他在1882年9月赴日期间制作了带有太极和四卦的版本。他与这一熟悉的旗帜形象密切相关，但不能简单认定他是所有早期版本的唯一创作者。'],
    ['1883年：正式确立', '高宗于1883年3月6日将太极旗定为国旗。因此，1882年对应这一早期样式的制作，1883年对应正式确立。大韩民国成立后，于1949年10月15日公布了统一的国旗制作规范。'],
  ],
  tr: [
    ['1882: neden bir bayrak gerekti?', 'Taegeukgi, Kore’nin uluslararası diplomasisini genişlettiği dönemde ortaya çıktı. ABD ile 1882’de yapılan antlaşma, ülkeyi temsil edecek bir ulusal bayrağa duyulan ihtiyacı gündeme getirdi. İmza törenindeki bayrağın kesin görünümü bilinmiyor.'],
    ['Kim katkıda bulundu?', 'Diplomat Park Yeong-hyo, Eylül 1882’de Japonya’ya giderken taegeuk ve dört trigramlı bir bayrak hazırladığını günlüğünde kaydetti. Tanınan tasarımla ilişkilidir; ancak bütün ilk sürümlerin tek yaratıcısı sayılması doğru olmaz.'],
    ['1883: resmen kabul edilmesi', 'Kral Gojong, 6 Mart 1883’te Taegeukgi’yi ulusal bayrak ilan etti. Böylece 1882 bilinen ilk tasarımla, 1883 resmî kabulle ilişkilidir. Kore Cumhuriyeti kurulduktan sonra, 15 Ekim 1949’da standart yapım kuralları açıklandı.'],
  ],
  vi: [
    ['1882: vì sao cần quốc kỳ?', 'Taegeukgi ra đời khi Hàn Quốc mở rộng quan hệ ngoại giao. Hiệp ước với Hoa Kỳ năm 1882 đặt ra nhu cầu có lá cờ đại diện cho đất nước. Hình dạng chính xác của lá cờ tại lễ ký chưa được xác định chắc chắn.'],
    ['Ai tham gia tạo nên lá cờ?', 'Theo nhật ký của nhà ngoại giao Park Yeong-hyo, ông chuẩn bị phiên bản có taegeuk và bốn quẻ trong chuyến đi Nhật Bản tháng 9 năm 1882. Ông gắn với thiết kế quen thuộc này, nhưng không nên coi là tác giả duy nhất của mọi phiên bản ban đầu.'],
    ['1883: chính thức công nhận', 'Vua Gojong công nhận Taegeukgi là quốc kỳ ngày 6 tháng 3 năm 1883. Năm 1882 gắn với mẫu cờ ban đầu quen thuộc, còn 1883 là năm công nhận chính thức. Sau khi Đại Hàn Dân Quốc thành lập, quy chuẩn chế tác thống nhất được công bố ngày 15 tháng 10 năm 1949.'],
  ],
  km: [
    ['1882៖ ហេតុអ្វីត្រូវការទង់ជាតិ?', 'Taegeukgi កើតឡើងនៅពេលកូរ៉េពង្រីកទំនាក់ទំនងការទូតអន្តរជាតិ។ សន្ធិសញ្ញាជាមួយសហរដ្ឋអាមេរិកឆ្នាំ 1882 នាំឱ្យត្រូវការទង់សម្រាប់តំណាងប្រទេស។ រូបរាងពិតប្រាកដនៃទង់នៅពិធីចុះហត្ថលេខាមិនទាន់ត្រូវបានបញ្ជាក់ច្បាស់ទេ។'],
    ['អ្នកណាបានចូលរួមបង្កើត?', 'តាមកំណត់ហេតុរបស់អ្នកការទូត Park Yeong-hyo គាត់បានរៀបចំទង់មានរង្វង់ taegeuk និងសញ្ញាបួន ក្នុងដំណើរទៅជប៉ុនខែកញ្ញា ឆ្នាំ 1882។ គាត់ទាក់ទងនឹងទម្រង់ដែលគេស្គាល់នេះ ប៉ុន្តែមិនគួរចាត់ទុកថាជាអ្នកបង្កើតតែម្នាក់នៃគ្រប់ទម្រង់ដំបូងទេ។'],
    ['1883៖ ការទទួលស្គាល់ជាផ្លូវការ', 'ព្រះបាទ Gojong ប្រកាស Taegeukgi ជាទង់ជាតិនៅថ្ងៃទី 6 ខែមីនា ឆ្នាំ 1883។ ឆ្នាំ 1882 ទាក់ទងនឹងទម្រង់ដំបូងដែលគេស្គាល់ ហើយឆ្នាំ 1883 ជាការទទួលស្គាល់ផ្លូវការ។ ក្រោយបង្កើតសាធារណរដ្ឋកូរ៉េ គោលការណ៍ផលិតទង់ឯកភាពត្រូវបានប្រកាសថ្ងៃទី 15 ខែតុលា ឆ្នាំ 1949។'],
  ],
  kk: [
    ['1882: ту не үшін қажет болды?', 'Тхэгыкки Кореяның халықаралық дипломатиясы кеңейген кезде пайда болды. 1882 жылғы АҚШ-пен шарт елді таныстыратын мемлекеттік тудың қажеттілігін туғызды. Қол қою рәсіміндегі тудың нақты бейнесі толық анықталмаған.'],
    ['Жасауға кім қатысты?', 'Дипломат Пак Ён Хё күнделігінде 1882 жылғы қыркүйекте Жапонияға сапары кезінде тхэгык пен төрт триграммасы бар нұсқаны дайындағанын жазған. Оның есімі таныс үлгімен байланысты, бірақ барлық алғашқы нұсқалардың жалғыз авторы деу дәл емес.'],
    ['1883: ресми бекітілуі', 'Коджон патша 1883 жылғы 6 наурызда тхэгыккиді мемлекеттік ту деп жариялады. 1882 жыл таныс алғашқы үлгімен, 1883 жыл ресми бекітілуімен байланысты. Корея Республикасы құрылғаннан кейін, 1949 жылғы 15 қазанда туды жасаудың бірыңғай ережелері жарияланды.'],
  ],
};
const lines = [[true, true, true], [false, false, false], [false, true, false], [true, false, true]];
function Trigram({ pattern }: { pattern: boolean[] }) {
  return <svg width="72" height="48" viewBox="0 0 72 48" aria-hidden="true" focusable="false">
    {pattern.map((solid, index) => <g key={index} fill="currentColor">
      {solid ? <rect x="0" y={index * 18} width="72" height="10" /> : <><rect x="0" y={index * 18} width="30" height="10" /><rect x="42" y={index * 18} width="30" height="10" /></>}
    </g>)}
  </svg>;
}

export default function KoreaFlag({ language }: { language: Language }) {
  const t = text[language];
  return <article id="korean-flag" className="korea-story" aria-labelledby="korean-flag-title">
    <h2 id="korean-flag-title">{t.title}</h2>
    <p className="korea-story-intro">{t.intro}</p>
    <Image src="/korea-story/flag-comic.webp" alt={t.title} width={2172} height={724} className="korea-story-art" sizes="(max-width: 760px) 100vw, 1264px" />
    <div className="korea-story-columns">{t.parts.map(([heading, body], index) =>
      <section className="korea-story-part" key={heading}>
        {index > 1 && <Trigram pattern={lines[index - 2]} />}
        <h3>{heading}</h3><p>{body}</p>
      </section>
    )}</div>
    <p className="korea-story-intro" style={{ marginTop: 28 }}>{t.note}</p>
    <div className="korea-story-columns" id="korean-flag-history">{history[language].map(([heading, body]) =>
      <section className="korea-story-part" key={heading}><h3>{heading}</h3><p>{body}</p></section>
    )}</div>
    <div className="source-row"><a href="https://www.mois.go.kr/eng/sub/a03/nationalSymbol/screen.do" target="_blank" rel="noreferrer">{copy[language][41]} · Ministry of the Interior and Safety ↗</a></div>
  </article>;
}
