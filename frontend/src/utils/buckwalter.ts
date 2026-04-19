/**
 * Standard Buckwalter transliteration to Arabic mappings
 */
const buckwalterMap: Record<string, string> = {
  "'": '\u0621', // Hamza
  '|': '\u0622', // Alef madda
  '>': '\u0623', // Alef hamza above
  '&': '\u0624', // Waw hamza
  '<': '\u0625', // Alef hamza below
  '}': '\u0626', // Ya hamza
  A: '\u0627', // Alef
  b: '\u0628', // Ba
  p: '\u0629', // Ta marbuta
  t: '\u062A', // Ta
  v: '\u062B', // Tha
  j: '\u062C', // Jeem
  H: '\u062D', // Haa
  x: '\u062E', // Khaa
  d: '\u062F', // Dal
  '*': '\u0630', // Thal
  r: '\u0631', // Ra
  z: '\u0632', // Zay
  s: '\u0633', // Seen
  $: '\u0634', // Sheen
  S: '\u0635', // Saad
  D: '\u0636', // Daad
  T: '\u0637', // Taa
  Z: '\u0638', // Dhaa
  E: '\u0639', // Ain
  g: '\u063A', // Ghain
  _: '\u0640', // Tatweel
  f: '\u0641', // Fa
  q: '\u0642', // Qaf
  k: '\u0643', // Kaf
  l: '\u0644', // Lam
  m: '\u0645', // Meem
  n: '\u0646', // Noon
  h: '\u0647', // Ha
  w: '\u0648', // Waw
  Y: '\u0649', // Alef maksura
  y: '\u064A', // Ya
  F: '\u064B', // Fathatan
  N: '\u064C', // Dammatan
  K: '\u064D', // Kasratan
  a: '\u064E', // Fatha
  u: '\u064F', // Damma
  i: '\u0650', // Kasra
  '~': '\u0651', // Shadda
  o: '\u0652', // Sukun
  '`': '\u0670', // Dagger alef
  '{': '\u0671', // Alef wasla
  '^': '', // Remove safe buckwalter delimiter if any
  '@': '', // Remove extra delimiters
};

/**
 * Converts a string from Buckwalter transliteration to Arabic script.
 * @param text The Buckwalter transliterated string.
 * @returns The converted Arabic string.
 */
export function buckwalterToArabic(text: string): string {
  if (!text) return '';
  return text
    .split('')
    .map((char) => buckwalterMap[char] || char)
    .join('');
}
