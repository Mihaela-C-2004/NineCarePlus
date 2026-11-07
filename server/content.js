/**
 * CONȚINUT DEMONSTRATIV.
 * Textele sunt generale și trebuie scrise sau verificate de un medic ori o moașă înainte de lansare.
 * Asistentul răspunde DOAR din aceste articole.
 */
const DEMO_AUTHOR = 'Echipa 9Care+ (conținut demonstrativ)';
const PENDING = null; // data verificării medicale: se completează după revizuire

export const ARTICLES = [
  {
    id: 'greata',
    titlu: 'Greața în primele luni de sarcină',
    categorie: 'Sarcina',
    cuvinte: ['greata', 'voma', 'varsaturi', 'stomac', 'mancare', 'dimineata', 'rau'],
    rezumat:
      'Greața e frecventă în primele luni de sarcină. Multe femei se simt mai bine cu mese mici și dese, cu gustări simple la îndemână și cu apă băută des, în cantități mici. Dacă nu poți păstra nici lichidele, spune-i medicului tău.',
    text: 'Greața apare des în primul trimestru și, la multe femei, scade după aceea. Pot ajuta mesele mici și dese, o gustare simplă dimineața, înainte să te ridici din pat, și evitarea mirosurilor care te deranjează. Bea apă des, în înghițituri mici. Dacă vomiți de mai multe ori pe zi, nu poți păstra lichidele sau scazi în greutate, spune-i medicului tău. Nu lua medicamente pentru greață fără recomandarea lui.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'spate',
    titlu: 'Disconfortul de spate în sarcină',
    categorie: 'Sarcina',
    cuvinte: ['spate', 'sale', 'postura', 'perna', 'lombar', 'disconfort'],
    rezumat:
      'Multe femei simt disconfort de spate în sarcină, pe măsură ce corpul se schimbă. Pot ajuta pauzele dese, încălțămintea comodă și o pernă sub burtă sau între genunchi la somn. Orice durere care te îngrijorează merită discutată cu medicul.',
    text: 'Pe măsură ce burtica crește, centrul de greutate se schimbă, iar mușchii spatelui lucrează mai mult. Pot ajuta pauzele dese, încălțămintea comodă, evitarea ridicării obiectelor grele și o pernă așezată sub burtă sau între genunchi când dormi pe o parte. Întreabă-ți medicul ce mișcare ți se potrivește. Durerea puternică, care nu trece sau vine la intervale regulate, trebuie spusă medicului.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'somn',
    titlu: 'Somnul în sarcină',
    categorie: 'Sarcina',
    cuvinte: ['somn', 'dormi', 'dormit', 'insomnie', 'noaptea', 'oboseala', 'perna'],
    rezumat:
      'În sarcină, somnul poate fi mai agitat. O rutină de seară liniștită, o pernă pentru sprijin și culcatul pe o parte îi ajută pe mulți să doarmă mai bine. Spune-i medicului dacă oboseala te împiedică să funcționezi peste zi.',
    text: 'Disconfortul, drumurile dese la baie și grijile pot face somnul mai agitat. O rutină de seară liniștită, o cameră răcoroasă și o pernă pentru sprijin pot ajuta. În a doua parte a sarcinii, multor femei li se recomandă să doarmă pe o parte. Odihna scurtă în timpul zilei e binevenită. Dacă oboseala te împiedică să funcționezi, discută cu medicul tău.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'miscare',
    titlu: 'Mișcarea fizică în sarcină',
    categorie: 'Sarcina',
    cuvinte: ['sport', 'miscare', 'sala', 'inot', 'yoga', 'plimbare', 'exercitii', 'activitate'],
    rezumat:
      'Pentru multe femei, mișcarea moderată, ca plimbările sau înotul, e benefică în sarcină. Ce ți se potrivește ție stabilește medicul, în funcție de cum evoluează sarcina ta.',
    text: 'Pentru multe femei, activitatea fizică moderată, cum ar fi plimbările, înotul sau cursurile făcute special pentru gravide, ajută la starea generală și la somn. Nu orice activitate e potrivită oricărei sarcini, așa că întreabă-ți medicul înainte să începi ceva nou. Oprește efortul și cere sfatul medicului dacă apar amețeli, durere, sângerare sau pierdere de lichid.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'hidratare',
    titlu: 'Alimentația și hidratarea',
    categorie: 'Sarcina',
    cuvinte: ['mancare', 'alimentatie', 'apa', 'hidratare', 'dieta', 'vitamine', 'mese', 'cafea'],
    rezumat:
      'O alimentație variată și apa băută regulat te ajută pe tot parcursul sarcinii. Vitaminele și suplimentele se iau doar la recomandarea medicului, care știe ce îți trebuie ție.',
    text: 'O alimentație variată, cu legume, fructe, cereale integrale și proteine, te ajută pe parcursul sarcinii. Bea apă regulat, mai ales când e cald. Unele alimente se evită în sarcină; medicul tău îți poate da lista potrivită. Vitaminele și suplimentele se iau doar la recomandarea medicului.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'miscari-bebelus',
    titlu: 'Mișcările bebelușului',
    categorie: 'Sarcina',
    cuvinte: ['miscari', 'misca', 'lovituri', 'bebelus', 'simt'],
    rezumat:
      'Pe măsură ce sarcina avansează, vei învăța ritmul obișnuit al mișcărilor bebelușului tău. Dacă observi că se mișcă mai puțin decât de obicei, nu aștepta: sună imediat la clinică sau mergi la urgențe.',
    text: 'Multe femei încep să simtă mișcările bebelușului în a doua parte a sarcinii, iar cu timpul învață ritmul lui obișnuit. Medicul îți poate spune cum să le urmărești. Dacă observi că bebelușul se mișcă mai puțin decât de obicei, nu aștepta până a doua zi: sună imediat la clinică sau mergi la urgențe.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'contractii',
    titlu: 'Contracțiile și semnele travaliului',
    categorie: 'Nașterea',
    cuvinte: ['contractii', 'travaliu', 'nastere', 'apa', 'maternitate', 'semne', 'braxton'],
    rezumat:
      'Spre finalul sarcinii pot apărea contracții neregulate, de „antrenament”. Contracțiile care devin regulate, mai dese și mai puternice, ruperea apei sau sângerarea sunt motive să suni la maternitate sau la clinică, după instrucțiunile primite de la medic.',
    text: 'Spre finalul sarcinii, multe femei simt contracții neregulate, care vin și trec. Travaliul începe de obicei cu contracții care devin regulate, tot mai dese și mai puternice. Medicul îți spune când să pleci spre maternitate. Ruperea apei, sângerarea sau scăderea mișcărilor bebelușului sunt motive să suni imediat la maternitate sau la 112.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'bagaj',
    titlu: 'Bagajul pentru maternitate',
    categorie: 'Nașterea',
    cuvinte: ['bagaj', 'maternitate', 'geanta', 'acte', 'haine', 'iau', 'pregatire'],
    rezumat:
      'Bagajul pentru maternitate e bine să fie gata cu câteva săptămâni înainte de data estimată. De obicei conține actele și analizele, haine comode, articole de igienă și hainele bebelușului. Lista exactă o primești de la clinica și maternitatea ta.',
    text: 'Pregătește bagajul cu câteva săptămâni înainte de data estimată. De obicei conține actul de identitate, analizele și documentele medicale, haine comode, articole de igienă, papuci, câteva schimburi pentru bebeluș și scutece. Fiecare maternitate are regulile ei, așa că verifică lista primită de la clinica ta. O găsești și în aplicație, la „Pregătirea pentru naștere”.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'alaptare',
    titlu: 'Primele zile de alăptare',
    categorie: 'Alăptarea',
    cuvinte: ['alaptare', 'alaptez', 'lapte', 'san', 'supt', 'atasare'],
    rezumat:
      'În primele zile, bebelușul poate cere să sugă des, iar asta e obișnuit. O poziție comodă și o atașare corectă contează mult. Dacă alăptarea doare sau ai nelămuriri, cere ajutorul moașei sau al unui consultant în alăptare.',
    text: 'În primele zile, bebelușul suge des și puțin, iar laptele se adaptează treptat. Găsește o poziție comodă și adu bebelușul la sân, nu sânul la bebeluș. Durerea care nu trece, febra sau o zonă roșie și caldă la sân sunt motive să discuți cu medicul. Moașa sau un consultant în alăptare te pot ajuta cu atașarea.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'somn-bebelus',
    titlu: 'Somnul în siguranță al bebelușului',
    categorie: 'Nou-născutul',
    cuvinte: ['bebelus', 'somn', 'patut', 'doarme', 'spate', 'siguranta'],
    rezumat:
      'Recomandarea generală pentru somnul bebelușului este pe spate, pe o saltea fermă, în pătuțul lui, fără perne, jucării sau pături groase în jur. Întreabă medicul pediatru despre orice nelămurire.',
    text: 'Recomandarea generală este ca bebelușul să doarmă pe spate, pe o saltea fermă, în pătuțul lui, fără perne, jucării sau pături groase în jur. Camera nu trebuie să fie prea caldă. Pentru orice nelămurire legată de somnul bebelușului, întreabă medicul pediatru.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'recuperare',
    titlu: 'Recuperarea după naștere',
    categorie: 'Recuperarea',
    cuvinte: ['recuperare', 'dupa nastere', 'lehuzie', 'odihna', 'control', 'cicatrice'],
    rezumat:
      'Recuperarea după naștere durează câteva săptămâni și arată diferit la fiecare femeie. Odihna, ajutorul celor apropiați și controlul de după naștere sunt importante. Febra, sângerarea abundentă sau durerea care crește trebuie spuse imediat medicului.',
    text: 'Corpul are nevoie de câteva săptămâni ca să se refacă după naștere. Odihnește-te cât poți și acceptă ajutorul celor apropiați. Nu rata controlul de după naștere. Febra, sângerarea abundentă, durerea care crește sau o rană care se înroșește sunt motive să suni imediat medicul sau să mergi la urgențe.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'emotii',
    titlu: 'Starea emoțională după naștere',
    categorie: 'Recuperarea',
    cuvinte: ['trista', 'tristete', 'plang', 'emotii', 'anxietate', 'depresie', 'copleșita', 'coplesita', 'stare'],
    rezumat:
      'În primele zile după naștere, multe mame trec prin schimbări rapide de dispoziție. Dacă tristețea, neliniștea sau senzația de copleșire nu trec după aproximativ două săptămâni, vorbește cu medicul tău. Nu ești singură și există ajutor.',
    text: 'În primele zile după naștere, multe mame au schimbări rapide de dispoziție, plâng ușor sau se simt copleșite. Dacă aceste stări nu trec după aproximativ două săptămâni, devin mai puternice sau te împiedică să ai grijă de tine și de bebeluș, vorbește cu medicul tău. Dacă ai gânduri să îți faci rău, sună imediat la 112. Nu ești singură și există ajutor.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
  {
    id: 'analize-sarcina',
    titlu: 'Analizele și ecografiile din sarcină',
    categorie: 'Sarcina',
    cuvinte: ['analize', 'ecografie', 'glucoza', 'test', 'morfologica', 'control', 'controale'],
    rezumat:
      'Pe parcursul sarcinii, medicul îți recomandă analize și ecografii la anumite momente. Calendarul exact îl stabilește medicul pentru tine; în aplicație vezi controalele programate de clinică.',
    text: 'Pe parcursul sarcinii se fac analize de sânge, analize de urină și câteva ecografii, la momente recomandate de medic. Fiecare sarcină e diferită, așa că planul exact îl stabilește medicul tău. În aplicație vezi controalele programate de clinică și poți trimite fotografia analizelor. Aplicația nu interpretează rezultatele: le discuți cu medicul.',
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
  },
];

export const COURSES = [
  {
    id: 'curs-nastere',
    titlu: 'Pregătirea pentru naștere',
    categorie: 'Nașterea',
    sarcina: true,
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
    lectii: [
      {
        id: 'n1',
        titlu: 'Ce se întâmplă în ultimele săptămâni',
        text: 'În ultimele săptămâni, bebelușul crește și se poziționează pentru naștere. E normal să te simți mai obosită și să ai nevoie de pauze dese. Folosește controalele ca să pui toate întrebările pe care le ai. Notează-le din timp în secțiunea Clinica.',
      },
      {
        id: 'n2',
        titlu: 'Când pleci spre maternitate',
        text: 'Medicul îți spune când să pleci spre maternitate, în funcție de sarcina ta. De obicei, contracțiile regulate și tot mai dese, ruperea apei sau sângerarea sunt semne după care suni la maternitate. Păstrează numărul maternității și al clinicii la îndemână.',
      },
      {
        id: 'n3',
        titlu: 'Bagajul și actele',
        text: 'Pregătește bagajul din timp și pune actele într-un dosar: actul de identitate, analizele și scrisoarea medicală, dacă ai primit una. Verifică lista primită de la clinica ta, în aplicație, la „Pregătirea pentru naștere”.',
      },
    ],
  },
  {
    id: 'curs-nou-nascut',
    titlu: 'Primele zile cu bebelușul',
    categorie: 'Nou-născutul',
    sarcina: false,
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
    lectii: [
      {
        id: 'b1',
        titlu: 'Somnul în siguranță',
        text: 'Bebelușul doarme pe spate, pe o saltea fermă, în pătuțul lui, fără perne sau jucării în jur. Camera nu trebuie să fie prea caldă. Pentru orice nelămurire, întreabă medicul pediatru.',
      },
      {
        id: 'b2',
        titlu: 'Hrănirea în primele zile',
        text: 'În primele zile, bebelușul mănâncă des. Fie că alăptezi, fie că folosești lapte praf, medicul sau moașa te pot ajuta să găsești ritmul potrivit. Cere ajutor dacă hrănirea doare sau ai nelămuriri.',
      },
      {
        id: 'b3',
        titlu: 'Când suni la medic',
        text: 'Notează numărul medicului pediatru și al clinicii. Dacă ceva ți se pare în neregulă cu bebelușul, sună. Pentru urgențe, sună la 112.',
      },
    ],
  },
  {
    id: 'curs-recuperare',
    titlu: 'Recuperarea după naștere',
    categorie: 'Recuperarea',
    sarcina: false,
    autor: DEMO_AUTHOR,
    verificatLa: PENDING,
    lectii: [
      {
        id: 'r1',
        titlu: 'Primele săptămâni',
        text: 'Corpul are nevoie de câteva săptămâni ca să se refacă. Odihnește-te cât poți, mănâncă regulat și acceptă ajutorul celor apropiați. Nu rata controlul de după naștere.',
      },
      {
        id: 'r2',
        titlu: 'Cum te simți tu',
        text: 'Schimbările de dispoziție din primele zile sunt frecvente. Dacă tristețea sau neliniștea nu trec după aproximativ două săptămâni, vorbește cu medicul tău. Check-in-ul zilnic din aplicație te ajută să vezi cum te-ai simțit în ultimele săptămâni.',
      },
    ],
  },
];

/** Oferte FICTIVE, adăugate de echipa 9Care+. Partenerii nu au cont în aplicație. */
export const OFFERS = [
  {
    id: 'o1',
    partener: 'Magazinul Bebe (demo)',
    categorie: 'magazin',
    descriere: 'Reducere la hăinuțe și articole pentru bebeluși.',
    reducere: '15%',
    cod: 'NINECARE15',
    valabilPana: '2027-03-31',
  },
  {
    id: 'o2',
    partener: 'Studio Foto Lumină (demo)',
    categorie: 'foto',
    descriere: 'Ședință foto în sarcină sau cu nou-născutul.',
    reducere: '20%',
    cod: 'FOTO9CARE',
    valabilPana: '2027-06-30',
  },
  {
    id: 'o3',
    partener: 'Sala Activ (demo)',
    categorie: 'sport',
    descriere: 'Abonament lunar la sală, cu cursuri pentru gravide și pentru mame.',
    reducere: '25%',
    cod: 'ACTIV9',
    valabilPana: '2027-02-28',
  },
  {
    id: 'o4',
    partener: 'Bazinul Val (demo)',
    categorie: 'sport',
    descriere: 'Abonament la înot și aqua-gym.',
    reducere: '20%',
    cod: 'VAL9CARE',
    valabilPana: '2027-05-31',
  },
];
