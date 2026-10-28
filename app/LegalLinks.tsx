export default function LegalLinks({language='ru'}:{language?:string}) {
 const labels:Record<string,string>={ru:'Правила, данные и обращения',en:'Rules, data and requests',ko:'이용 규칙, 정보 처리 및 문의',uz:'Qoidalar, ma’lumotlar va murojaatlar',zh:'规则、数据与申诉',vi:'Quy định, dữ liệu và yêu cầu',tr:'Kurallar, veriler ve başvurular',kk:'Ережелер, деректер және өтініштер',km:'ច្បាប់ ទិន្នន័យ និងសំណើ'};
 return <p style={{fontSize:13,margin:'16px 0'}}><a href={"/legal?lang="+encodeURIComponent(language)} target="_blank" rel="noopener noreferrer" style={{textDecoration:'underline'}}>{labels[language]??labels.en}</a></p>;
}
