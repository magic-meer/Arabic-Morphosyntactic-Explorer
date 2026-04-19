export const formatFeatureValue = (key: string, value: string) => {
  if (!value || value === 'na' || value === 'N/A') return value;
  
  const mappings: Record<string, Record<string, string>> = {
    gen: { m: 'Masculine / مذكّر', f: 'Feminine / مؤنّث' },
    num: { s: 'Singular / مفرد', d: 'Dual / مثنّى', p: 'Plural / جمع' },
    cas: { u: 'Nominative / مرفوع', a: 'Accusative / منصوب', i: 'Genitive / مجرور' },
    mod: { i: 'Indicative / مرفوع', s: 'Subjunctive / منصوب', j: 'Jussive / مجزوم' },
    asp: { i: 'Imperfective / مضارع', p: 'Perfective / ماضٍ', c: 'Imperative / أمر' },
    per: { '1': '1st Person / المتكلّم', '2': '2nd Person / المخاطب', '3': '3rd Person / الغائب' },
    vox: { a: 'Active / معلوم', p: 'Passive / مجهول' },
    pos: { 
      noun: 'Noun / اسم', 
      verb: 'Verb / فعل', 
      adj: 'Adjective / صفة', 
      prep: 'Preposition / حرف جر',
      conj: 'Conjunction / حرف عطف',
      pron: 'Pronoun / ضمير',
      part: 'Particle / حرف',
      adv: 'Adverb / ظرف'
    }
  };

  return mappings[key]?.[value] || value;
};
