import Image from 'next/image';
import { copy, type Language } from './content';

type Story = { title: string; intro: string; parts: [string, string][] };
const stories: Record<Language, Story> = {
  ru: { title: 'Ханбок: традиционная одежда Кореи', intro: 'Ханбок (한복) узнают по плавным линиям, свободному силуэту и выразительным сочетаниям цветов. Это не один неизменный костюм: его формы менялись с эпохой, сезоном и назначением.', parts: [
    ['Из чего состоит ханбок', 'Чогори (저고리) — верхняя часть комплекта. В традиционном женском наряде её сочетают с объёмной юбкой чхима (치마), в мужском — со свободными брюками паджи (바지). Завязки корым (고름) закрепляют чогори, а турумаги (두루마기) служит верхней одеждой.'],
    ['Когда его носят', 'Сегодня ханбок особенно заметен на Соллаль и Чхусок, свадьбах и семейных торжествах, включая первый день рождения ребёнка. Он связан не только с красотой наряда, но и с уважением к близким и традициям.'],
    ['Традиция в современной жизни', 'Дизайнеры создают повседневные версии с более удобной длиной и современными сочетаниями вещей. Праздничный и повседневный ханбок могут сильно отличаться: знакомые линии и детали получают новое прочтение, а традиция продолжает развиваться.'],
  ] },
  en: { title: 'Hanbok: Korea’s traditional clothing', intro: 'Hanbok (한복) is known for flowing lines, generous silhouettes and expressive colors. Its forms have changed with the period, season and occasion.', parts: [
    ['The main pieces', 'Jeogori (저고리) is the upper garment. Traditional women’s outfits pair it with a full chima (치마) skirt; men’s outfits with roomy baji (바지) trousers. Goreum (고름) ribbons fasten the top, while durumagi (두루마기) is outerwear.'],
    ['When it is worn', 'Hanbok is especially visible at Seollal, Chuseok, weddings and family celebrations such as a child’s first birthday. Wearing it can express respect for family and tradition.'],
    ['A living tradition', 'Designers adapt hanbok for everyday life with practical lengths and contemporary combinations. Festive and casual versions differ, while familiar lines and details continue to inspire new clothing.'],
  ] },
  ko: { title: '한복: 한국의 전통 의복', intro: '한복은 부드러운 선과 여유로운 실루엣, 다채로운 색의 조화가 특징입니다. 시대와 계절, 용도에 따라 형태가 달라져 왔습니다.', parts: [
    ['한복의 구성', '저고리는 윗옷입니다. 전통적인 여성 복식은 치마와, 남성 복식은 여유로운 바지와 함께 입습니다. 고름은 저고리를 여미는 끈이며, 두루마기는 겉옷입니다.'],
    ['언제 입을까요?', '오늘날 설날과 추석, 혼례, 돌잔치 같은 가족 행사에서 한복을 볼 수 있습니다. 아름다운 옷차림이면서 가족과 전통을 존중하는 마음을 나타내기도 합니다.'],
    ['오늘의 한복', '디자이너들은 실용적인 길이와 현대적인 조합으로 일상에 어울리는 한복을 만듭니다. 예복과 생활한복은 모습이 다르지만 익숙한 선과 요소를 새롭게 해석하며 전통을 이어 갑니다.'],
  ] },
  zh: { title: '韩服：韩国的传统服饰', intro: '韩服（한복）以流畅的线条、宽松的轮廓和丰富的配色著称。它的形制随时代、季节和用途而变化。', parts: [
    ['主要组成', 'Jeogori（저고리）是上衣。传统女装搭配宽大的chima（치마）裙，男装搭配宽松的baji（바지）裤。Goreum（고름）衣带用于系合上衣，durumagi（두루마기）是外衣。'],
    ['什么时候穿？', '如今在春节、秋夕、婚礼和孩子周岁等家庭庆典上，经常能见到韩服。它不仅是美丽的服装，也能表达对家人和传统的尊重。'],
    ['走进现代生活', '设计师通过实用的长度和现代搭配，让韩服适合日常穿着。礼服与生活韩服各有特点，熟悉的线条和细节不断获得新的诠释。'],
  ] },
  tr: { title: 'Hanbok: Kore’nin geleneksel giysisi', intro: 'Hanbok (한복), akıcı çizgileri, bol kesimi ve renk uyumuyla tanınır. Biçimleri döneme, mevsime ve kullanım amacına göre değişmiştir.', parts: [
    ['Temel parçaları', 'Jeogori (저고리) üst giysidir. Geleneksel kadın kıyafetinde geniş chima (치마) etekle, erkek kıyafetinde bol baji (바지) pantolonla tamamlanır. Goreum (고름) bağları üstü kapatır; durumagi (두루마기) dış giysidir.'],
    ['Ne zaman giyilir?', 'Hanbok bugün özellikle Seollal, Chuseok, düğünler ve çocuğun ilk doğum günü gibi aile kutlamalarında görülür. Aileye ve geleneklere saygıyı da ifade edebilir.'],
    ['Yaşayan bir gelenek', 'Tasarımcılar kullanışlı boylar ve çağdaş kombinlerle günlük hanbok üretir. Törenlik ve günlük modeller farklı olsa da tanıdık çizgiler ve ayrıntılar yeni yorumlarla yaşamaya devam eder.'],
  ] },
  vi: { title: 'Hanbok: trang phục truyền thống Hàn Quốc', intro: 'Hanbok (한복) nổi bật với đường nét mềm mại, phom rộng và cách phối màu. Kiểu dáng thay đổi theo thời kỳ, mùa và mục đích sử dụng.', parts: [
    ['Các phần chính', 'Jeogori (저고리) là áo trên. Trang phục nữ truyền thống kết hợp với váy chima (치마) rộng, còn nam kết hợp với quần baji (바지). Dây goreum (고름) dùng để buộc áo; durumagi (두루마기) là áo khoác ngoài.'],
    ['Mặc vào dịp nào?', 'Ngày nay hanbok thường xuất hiện vào Seollal, Chuseok, đám cưới và lễ gia đình như thôi nôi. Trang phục này cũng có thể thể hiện sự tôn trọng gia đình và truyền thống.'],
    ['Truyền thống trong đời sống mới', 'Nhà thiết kế điều chỉnh độ dài và cách phối để hanbok phù hợp với sinh hoạt thường ngày. Bản lễ phục và bản thường phục khác nhau nhưng đều tiếp nối những đường nét quen thuộc bằng cách thể hiện mới.'],
  ] },
  km: { title: 'Hanbok៖ សម្លៀកបំពាក់ប្រពៃណីកូរ៉េ', intro: 'Hanbok (한복) មានខ្សែរូបរាងទន់ភ្លន់ ទម្រង់ធូររលុង និងពណ៌ស្រស់ស្អាត។ ទម្រង់របស់វាប្រែប្រួលតាមសម័យ រដូវ និងការប្រើប្រាស់។', parts: [
    ['ផ្នែកសំខាន់ៗ', 'Jeogori (저고리) ជាអាវខាងលើ។ ស្ត្រីជាទូទៅពាក់ជាមួយសំពត់ធំ chima (치마) ហើយបុរសពាក់ជាមួយខោធូរ baji (바지)។ ខ្សែ goreum (고름) ប្រើសម្រាប់ចងអាវ ហើយ durumagi (두루마기) ជាអាវក្រៅ។'],
    ['ពាក់នៅពេលណា?', 'សព្វថ្ងៃ គេឃើញ hanbok ក្នុងបុណ្យ Seollal, Chuseok ពិធីមង្គលការ និងពិធីគ្រួសារ ដូចជាខួបកំណើតមួយឆ្នាំរបស់កុមារ។ វាក៏បង្ហាញការគោរពគ្រួសារ និងប្រពៃណី។'],
    ['ប្រពៃណីក្នុងជីវិតសម័យថ្មី', 'អ្នករចនាកែសម្រួលប្រវែង និងការផ្គូផ្គងឱ្យងាយពាក់ប្រចាំថ្ងៃ។ សម្លៀកបំពាក់ពិធី និងប្រចាំថ្ងៃអាចខុសគ្នា ប៉ុន្តែខ្សែរូបរាង និងព័ត៌មានលម្អិតដែលគេស្គាល់បន្តរស់នៅក្នុងទម្រង់ថ្មី។'],
  ] },
  kk: { title: 'Ханбок: Кореяның дәстүрлі киімі', intro: 'Ханбок (한복) жұмсақ сызықтарымен, кең пішімімен және түстер үйлесімімен танылады. Оның үлгілері дәуірге, маусымға және қолданылуына қарай өзгерген.', parts: [
    ['Негізгі бөліктері', 'Чогори (저고리) — үстіңгі киім. Дәстүрлі әйел киімінде ол кең чхима (치마) белдемшесімен, ерлерде кең паджи (바지) шалбарымен үйлеседі. Корым (고름) баулары чогориді байлайды, ал турумаги (두루마기) — сырт киім.'],
    ['Қашан киеді?', 'Бүгінде ханбокты Соллаль, Чхусок, үйлену тойы және баланың бір жасқа толуы сияқты отбасылық мерекелерде көруге болады. Ол отбасы мен дәстүрге құрметті де білдіреді.'],
    ['Қазіргі өмірдегі дәстүр', 'Дизайнерлер ыңғайлы ұзындық пен заманауи үйлесімдер арқылы күнделікті ханбок жасайды. Салтанатты және күнделікті үлгілер әртүрлі болғанымен, таныс сызықтар мен бөлшектер жаңа түсінікпен жалғасады.'],
  ] },
};

export default function HanbokStory({ language }: { language: Language }) {
  const t = stories[language];
  return <article id="hanbok" className="korea-story" aria-labelledby="hanbok-title">
    <h2 id="hanbok-title">{t.title}</h2><p className="korea-story-intro">{t.intro}</p>
    <Image src="/korea-story/hanbok-comic.webp" alt={t.title} width={2172} height={724} className="korea-story-art" sizes="(max-width: 760px) 100vw, 1264px" />
    <div className="korea-story-columns">{t.parts.map(([heading, body], index) => <section className="korea-story-part" key={heading}><span aria-hidden="true">0{index + 1}</span><h3>{heading}</h3><p>{body}</p></section>)}</div>
    <div className="source-row">
      <a href="https://www.korea.net/NewsFocus/Culture/view?articleId=218297" target="_blank" rel="noreferrer">{copy[language][41]} · Korea.net ↗</a>
      <a href="https://www.nfm.go.kr/k-box/ui/hanbok/female?lang=en" target="_blank" rel="noreferrer">{copy[language][41]} · National Folk Museum of Korea ↗</a>
    </div>
  </article>;
}