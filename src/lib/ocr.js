import Tesseract from 'tesseract.js';
import { ANALYTES } from '../data/analytes.js';

export const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const NUMBER = /\d+(?:[.,]\d+)?/;
const RANGE = /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/;
const toNumber = (s) => Number(String(s).replace(',', '.'));

/**
 * Citește textul din fotografia buletinului, direct în browser.
 * Prima rulare descarcă modelul de limbă română (are nevoie de internet).
 */
export async function readImage(image, onProgress) {
  const { data } = await Tesseract.recognize(image, 'ron', {
    logger: (m) => {
      if (m.status === 'recognizing text') onProgress?.(m.progress);
    },
  });
  return data.text;
}

/**
 * Caută în text analizele cunoscute și extrage valoarea și intervalul de referință.
 * Nu interpretează rezultatele: doar arată ce e în afara intervalului tipărit pe buletin.
 */
export function parseLabText(text) {
  const lines = text.split(/\r?\n/).map(normalize);
  const results = [];
  for (const analyte of ANALYTES) {
    for (const line of lines) {
      const alias = analyte.aliases.find((a) => line.includes(a));
      if (!alias) continue;
      const rest = line.slice(line.indexOf(alias) + alias.length);
      const valueMatch = rest.match(NUMBER);
      if (!valueMatch) continue;
      const afterValue = rest.slice(valueMatch.index + valueMatch[0].length);
      let range = afterValue.match(RANGE);
      // Un interval citit greșit (de ex. „170-105”) e ignorat; mama îl poate corecta de mână.
      if (range && toNumber(range[1]) > toNumber(range[2])) range = null;
      results.push({
        key: analyte.key,
        name: analyte.name,
        unit: analyte.unit,
        value: toNumber(valueMatch[0]),
        refMin: range ? toNumber(range[1]) : null,
        refMax: range ? toNumber(range[2]) : null,
      });
      break;
    }
  }
  return results;
}

export function flagOf(v) {
  if (v.refMin != null && v.value < v.refMin) return 'sub';
  if (v.refMax != null && v.value > v.refMax) return 'peste';
  return 'ok';
}
