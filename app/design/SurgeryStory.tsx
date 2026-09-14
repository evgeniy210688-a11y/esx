import Image from 'next/image';
import { copy, type Language } from './content';

const surgery: Record<Language, string[]> = {
  "ru": [
    "Хирургия в Южной Корее: от консультации до восстановления",
    "Пластическая хирургия в Корее включает эстетические операции и реконструкцию — восстановление тканей и функций после травм, врождённых нарушений или лечения заболеваний. Знакомство с этим направлением начинается с понимания своих целей и беседы с профильным врачом.",
    "Консультация без спешки",
    "Обсудите с хирургом показания, альтернативы, ожидаемый результат и возможные осложнения. Расскажите о заболеваниях, лекарствах и прошлых операциях. Решение принимают после индивидуальной оценки: популярность процедуры не означает, что она подходит каждому.",
    "Как проверить клинику",
    "На портале Medical Korea можно найти учреждения, зарегистрированные для работы с иностранными пациентами. Регистрация и аккредитация KAHF — разные статусы; ни один из них не гарантирует результат операции. Уточните квалификацию хирурга, условия анестезии, полную стоимость и наличие медицинского переводчика.",
    "Восстановление — часть плана",
    "Заранее согласуйте контрольные приёмы, связь с клиникой и помощь после возвращения домой. Сроки восстановления и перелёта определяет врач: операция и авиаперелёт могут повышать риск тромбов. Получите понятные письменные рекомендации. Статья носит ознакомительный характер и не заменяет консультацию."
  ],
  "en": [
    "Surgery in South Korea: consultation to recovery",
    "Plastic surgery in Korea includes cosmetic procedures and reconstruction of tissues and function after injuries, congenital conditions or treatment. Start by clarifying your goals with a specialist.",
    "A thoughtful consultation",
    "Discuss indications, alternatives, expected outcomes and possible complications. Share your medical history, medicines and previous operations. A popular procedure is not suitable for everyone; decisions require individual assessment.",
    "Checking a clinic",
    "Medical Korea lists institutions registered to serve international patients. Registration and KAHF accreditation are different statuses; neither guarantees an outcome. Ask about the surgeon’s qualifications, anesthesia, total costs and medical interpretation.",
    "Planning recovery",
    "Arrange follow-up visits, contact with the clinic and care at home. Your doctor should advise on recovery and flying: surgery and air travel can increase blood-clot risk. Request clear written instructions. This article is general information, not a medical consultation."
  ],
  "ko": [
    "한국의 수술: 상담부터 회복까지",
    "한국의 성형외과는 미용 수술과 함께 외상, 선천적 질환 또는 치료 후 조직과 기능을 회복하는 재건 수술을 다룹니다. 자신의 목적을 정리하고 전문의와 상담하는 것이 시작입니다.",
    "충분한 상담",
    "수술의 필요성, 대안, 예상 결과와 합병증을 상담하세요. 질환, 복용약과 수술 이력을 알리세요. 유행하는 수술도 모두에게 적합한 것은 아니며 개인별 평가가 필요합니다.",
    "의료기관 확인",
    "Medical Korea에서 외국인 환자 유치 등록 의료기관을 확인할 수 있습니다. 등록과 KAHF 인증은 서로 다르며 결과를 보장하지 않습니다. 의사의 자격, 마취, 총비용과 의료 통역을 확인하세요.",
    "회복 계획",
    "추적 진료, 병원 연락 방법과 귀국 후 관리를 미리 정하세요. 수술과 비행은 혈전 위험을 높일 수 있으므로 회복과 비행 시기는 담당 의사와 상의하세요. 이해하기 쉬운 서면 안내를 받으세요. 이 글은 일반 정보이며 진료를 대신하지 않습니다."
  ],
  "zh": [
    "韩国外科：从咨询到恢复",
    "韩国整形外科包括美容手术，以及因创伤、先天性疾病或治疗后进行的组织与功能重建。先明确自己的目标，再与专科医生交流。",
    "充分咨询",
    "讨论手术必要性、替代方案、预期效果与并发症。告知病史、用药及既往手术。热门手术并非适合所有人，需要个体评估。",
    "核实医疗机构",
    "Medical Korea列有接待外国患者的注册医疗机构。注册与KAHF认证是不同状态，都不保证手术效果。确认医生资质、麻醉安排、总费用及医疗口译服务。",
    "安排恢复",
    "提前安排复诊、医院联系方式及回国后的照护。手术和飞行可能增加血栓风险，恢复和乘机时间应咨询医生。索取清晰的书面说明。本文仅为一般信息，不能替代医疗咨询。"
  ],
  "tr": [
    "Güney Kore’de cerrahi: danışmadan iyileşmeye",
    "Kore’de plastik cerrahi, estetik işlemler ile yaralanma, doğuştan gelen durumlar veya tedavi sonrası doku ve işlevin yeniden yapılandırılmasını kapsar. Hedeflerinizi bir uzmanla değerlendirin.",
    "Acele etmeden danışın",
    "Gereklilikleri, alternatifleri, beklenen sonuçları ve komplikasyonları konuşun. Hastalıklarınızı, ilaçlarınızı ve önceki ameliyatlarınızı bildirin. Popüler bir işlem herkese uygun değildir.",
    "Kliniği kontrol edin",
    "Medical Korea, yabancı hastalara hizmet için kayıtlı kurumları listeler. Kayıt ve KAHF akreditasyonu farklıdır; sonuç garantisi değildir. Cerrahın niteliğini, anesteziyi, toplam ücreti ve tıbbi tercümeyi sorun.",
    "İyileşmeyi planlayın",
    "Kontrolleri, klinikle iletişimi ve eve dönüş sonrası bakımı düzenleyin. Ameliyat ve uçuş pıhtı riskini artırabilir; zamanlamayı doktorunuzla belirleyin. Yazılı talimat isteyin. Bu yazı genel bilgidir, muayenenin yerine geçmez."
  ],
  "vi": [
    "Phẫu thuật tại Hàn Quốc: từ tư vấn đến hồi phục",
    "Phẫu thuật tạo hình tại Hàn Quốc bao gồm thẩm mỹ và tái tạo mô, chức năng sau chấn thương, dị tật bẩm sinh hoặc điều trị. Hãy trao đổi mục tiêu với bác sĩ chuyên khoa.",
    "Tư vấn kỹ lưỡng",
    "Hỏi về chỉ định, lựa chọn thay thế, kết quả dự kiến và biến chứng. Cung cấp bệnh sử, thuốc đang dùng và các ca mổ trước. Thủ thuật phổ biến không phù hợp với tất cả mọi người.",
    "Kiểm tra cơ sở y tế",
    "Medical Korea liệt kê cơ sở đăng ký phục vụ bệnh nhân quốc tế. Đăng ký và chứng nhận KAHF là hai trạng thái khác nhau, không bảo đảm kết quả. Hỏi về chuyên môn bác sĩ, gây mê, tổng chi phí và phiên dịch y tế.",
    "Lên kế hoạch hồi phục",
    "Sắp xếp tái khám, liên hệ phòng khám và chăm sóc khi về nước. Phẫu thuật và đi máy bay có thể tăng nguy cơ huyết khối; hỏi bác sĩ về thời điểm phù hợp. Xin hướng dẫn bằng văn bản. Bài viết chỉ cung cấp thông tin chung, không thay thế tư vấn y khoa."
  ],
  "km": [
    "ការវះកាត់នៅកូរ៉េខាងត្បូង៖ ពីការពិគ្រោះដល់ការជាសះស្បើយ",
    "ការវះកាត់កែសម្ផស្សនៅកូរ៉េរួមមានការកែរូបរាង និងការស្ដារជាលិកា និងមុខងារក្រោយរបួស បញ្ហាពីកំណើត ឬការព្យាបាល។ ពិភាក្សាគោលដៅជាមួយវេជ្ជបណ្ឌិតឯកទេស។",
    "ពិគ្រោះដោយមិនប្រញាប់",
    "សួរអំពីភាពចាំបាច់ ជម្រើសផ្សេង លទ្ធផល និងផលវិបាក។ ប្រាប់អំពីជំងឺ ថ្នាំ និងប្រវត្តិវះកាត់។ វិធីដែលពេញនិយមមិនសមស្របសម្រាប់មនុស្សគ្រប់រូបទេ។",
    "ពិនិត្យគ្លីនិក",
    "Medical Korea មានបញ្ជីស្ថាប័នចុះឈ្មោះទទួលអ្នកជំងឺបរទេស។ ការចុះឈ្មោះ និងការទទួលស្គាល់ KAHF ខុសគ្នា ហើយមិនធានាលទ្ធផលទេ។ សួរអំពីគុណវុឌ្ឍិគ្រូពេទ្យ ការប្រើថ្នាំសន្លប់ តម្លៃសរុប និងអ្នកបកប្រែវេជ្ជសាស្ត្រ។",
    "រៀបចំការជាសះស្បើយ",
    "រៀបចំការពិនិត្យតាមដាន ទំនាក់ទំនងគ្លីនិក និងការថែទាំក្រោយត្រឡប់ផ្ទះ។ ការវះកាត់ និងការហោះហើរអាចបង្កើនហានិភ័យកំណកឈាម ដូច្នេះសួរគ្រូពេទ្យអំពីពេលវេលា។ សុំការណែនាំជាលាយលក្ខណ៍អក្សរ។ អត្ថបទនេះជាព័ត៌មានទូទៅ មិនជំនួសការពិគ្រោះវេជ្ជសាស្ត្រទេ។"
  ],
  "kk": [
    "Оңтүстік Кореядағы хирургия: кеңестен қалпына келуге дейін",
    "Кореядағы пластикалық хирургия эстетикалық операциялармен қатар жарақат, туа біткен жағдайлар немесе емнен кейін тіндер мен қызметтерді қалпына келтіруді қамтиды. Алдымен мақсатыңызды бейінді дәрігермен талқылаңыз.",
    "Асықпай кеңесу",
    "Көрсетілімдерді, баламаларды, күтілетін нәтижені және асқынуларды талқылаңыз. Аурулар, дәрілер және бұрынғы операциялар туралы айтыңыз. Танымал әдіс бәріне бірдей жарамайды.",
    "Клиниканы тексеру",
    "Medical Korea шетелдік пациенттерге қызмет көрсету үшін тіркелген мекемелерді көрсетеді. Тіркеу мен KAHF аккредитациясы бөлек мәртебелер, нәтиже кепілі емес. Хирург біліктілігін, анестезияны, толық құнды және медициналық аудармашыны нақтылаңыз.",
    "Қалпына келуді жоспарлау",
    "Бақылау қабылдауларын, клиникамен байланысты және үйге оралғаннан кейінгі күтімді келісіңіз. Операция мен ұшу тромб қаупін арттыруы мүмкін; мерзімдерін дәрігермен талқылаңыз. Жазбаша нұсқаулық алыңыз. Мақала жалпы ақпарат береді, дәрігер кеңесін алмастырмайды."
  ]
};

export default function SurgeryStory({ language }: { language: Language }) {
  const t = surgery[language];
  return (
    <article className="korea-story" aria-labelledby="surgery-story-title">
      <h2 id="surgery-story-title">{t[0]}</h2>
      <p className="korea-story-intro">{t[1]}</p>
      <Image className="korea-story-art" src="/korea-story/surgery-comic.webp" alt={t[0]} width={1800} height={600} sizes="(max-width: 760px) 100vw, 1264px" />
      <div className="korea-story-columns">
        {[2, 4, 6].map((n, i) => (
          <section className="korea-story-part" key={n}>
            <span aria-hidden="true">0{i + 1}</span>
            <h3>{t[n]}</h3><p>{t[n + 1]}</p>
          </section>
        ))}
      </div>
      <div className="source-row">
        <a href="https://www.medicalkorea.or.kr/en/reconstructiveSurgery" target="_blank" rel="noreferrer">{copy[language][41]} · Medical Korea ↗</a>
        <a href="https://www.medicalkorea.or.kr/en/registeredhospitals" target="_blank" rel="noreferrer">Medical Korea · Registry ↗</a>
        <a href="https://www.nhs.uk/tests-and-treatments/cosmetic-procedures/advice/cosmetic-surgery-abroad/" target="_blank" rel="noreferrer">{copy[language][41]} · NHS ↗</a>
      </div>
    </article>
  );
}

