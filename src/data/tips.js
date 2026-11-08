// Conținut DEMONSTRATIV, general. În aplicația reală, fiecare sfat e aprobat de medicii clinicii.
export const PREGNANCY_TIPS = [
  'Notează întrebările pe măsură ce îți vin în minte, ca să nu le uiți la consultație.',
  'Bea apă des, în cantități mici, pe tot parcursul zilei.',
  'O plimbare scurtă și liniștită te poate ajuta să te simți mai bine. Întreabă-ți medicul ce activitate ți se potrivește.',
  'Odihna contează. Dacă poți, fă o pauză scurtă în mijlocul zilei.',
  'Ia-ți cu tine analizele recente la fiecare consultație sau trimite-le din aplicație.',
  'Dacă ceva ți se pare neobișnuit, e în regulă să întrebi. Pentru asta e clinica ta.',
  'Mesele mai mici și mai dese sunt adesea mai ușor de suportat decât trei mese mari.',
  'Spune-le celor apropiați cum te pot ajuta. Nu trebuie să duci totul singură.',
  'Notează din timp întrebările pentru următorul control, în secțiunea Clinica.',
  'Pune-ți medicamentele recomandate de medic într-un loc la vedere, ca să nu le uiți.',
];

export const POSTPARTUM_TIPS = [
  'Recuperarea după naștere durează. Fii blândă cu tine.',
  'Doarme când doarme și bebelușul, măcar o dată pe zi.',
  'E normal să ai zile grele. Dacă tristețea nu trece, spune-i medicului tău.',
  'Acceptă ajutorul oferit de familie și prieteni.',
  'Mănâncă regulat și bea suficientă apă, mai ales dacă alăptezi.',
  'Notează întrebările despre recuperare pentru controlul de după naștere.',
];

export function tipOfTheDay(list, date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return list[dayIndex % list.length];
}

export const PREGNANCY_TIPS_EN = [
  'Write down questions as they come to mind, so you don’t forget them at your check-up.',
  'Drink water often, a little at a time, throughout the day.',
  'A short, relaxed walk can help you feel better. Ask your doctor which activity suits you.',
  'Rest matters. If you can, take a short break in the middle of the day.',
  'Bring your recent lab results to every check-up, or send them from the app.',
  'If something feels unusual, it’s fine to ask. That’s what your clinic is for.',
  'Smaller, more frequent meals are often easier than three big ones.',
  'Tell the people close to you how they can help. You don’t have to do it all alone.',
  'Write down your questions for the next check-up in the Clinic section.',
  'Keep the medicines your doctor recommended somewhere visible, so you don’t forget them.',
];

export const POSTPARTUM_TIPS_EN = [
  'Recovering after birth takes time. Be gentle with yourself.',
  'Sleep when your baby sleeps, at least once a day.',
  'Hard days are normal. If the sadness doesn’t pass, tell your doctor.',
  'Accept help from family and friends.',
  'Eat regularly and drink enough water, especially if you’re breastfeeding.',
  'Write down your recovery questions for your post-birth check-up.',
];
