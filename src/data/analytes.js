// Analizele recunoscute automat din fotografia buletinului.
// Aliasurile sunt scrise fără diacritice și cu litere mici, pentru că textul citit e normalizat la fel.
export const ANALYTES = [
  { key: 'hemoglobina', name: 'Hemoglobină', unit: 'g/dL', aliases: ['hemoglobina', 'hemoglobin'] },
  { key: 'hematocrit', name: 'Hematocrit', unit: '%', aliases: ['hematocrit'] },
  { key: 'leucocite', name: 'Leucocite', unit: 'mii/µL', aliases: ['leucocite', 'leucocit'] },
  { key: 'trombocite', name: 'Trombocite', unit: 'mii/µL', aliases: ['trombocite', 'trombocit'] },
  { key: 'glicemie', name: 'Glicemie', unit: 'mg/dL', aliases: ['glicemie', 'glucoza'] },
  { key: 'tsh', name: 'TSH', unit: 'µUI/mL', aliases: ['tsh'] },
  { key: 'feritina', name: 'Feritină', unit: 'ng/mL', aliases: ['feritina', 'ferritina'] },
  { key: 'fier', name: 'Fier seric', unit: 'µg/dL', aliases: ['fier seric', 'sideremie'] },
  { key: 'creatinina', name: 'Creatinină', unit: 'mg/dL', aliases: ['creatinina'] },
];
