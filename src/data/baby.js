// Ce arată ecranul Acasă după naștere, lună cu lună. Texte generale: fiecare copil are ritmul lui.
const STAGES = [
  'Primele săptămâni: somn mult, mese dese și multă apropiere.',
  'Mulți bebeluși încep să urmărească fețele cu privirea.',
  'Mulți bebeluși zâmbesc când le zâmbești.',
  'Mulți bebeluși își țin mai bine capul și gânguresc.',
  'Mulți bebeluși încep să apuce jucăriile.',
  'Mulți bebeluși se rostogolesc și râd în hohote.',
  'Mulți bebeluși stau în fund cu sprijin.',
  'Mulți bebeluși încep să se târască.',
  'Mulți bebeluși își recunosc numele.',
  'Mulți bebeluși se ridică ținându-se de mobilă.',
  'Mulți bebeluși fac „pa-pa” cu mâna.',
  'Mulți bebeluși fac primii pași cu ajutor.',
  'La mulți ani! Primul an împreună.',
];

export function babyStage(birthDate) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(`${birthDate}T12:00:00`).getTime()) / 86400000));
  const months = Math.min(12, Math.floor(days / 30.44));
  const weeks = Math.floor(days / 7);
  // Bebelușul „crește” pe ecran: imaginea se mărește lună de lună, iar de la 9 luni devine copil.
  const img = months >= 9 ? '/img/child.png' : '/img/baby.png';
  const scale = months >= 9 ? 0.86 + (months - 9) * 0.04 : 0.62 + months * 0.045;
  const toy = months < 3 ? '/img/bottle.png' : months < 12 ? '/img/teddy.png' : '/img/balloon.png';
  const age = months === 0 ? (weeks <= 1 ? 'prima săptămână' : `${weeks} săptămâni`) : months === 1 ? 'o lună' : `${months} luni`;
  return { months, weeks, img, scale, toy, age, text: STAGES[months] };
}
