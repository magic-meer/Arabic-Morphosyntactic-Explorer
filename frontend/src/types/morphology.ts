export interface MorphologyFeatures {
  pos?: string;
  lemma?: string;
  root?: string;
  gender?: string;
  number?: string;
  case?: string;
  mood?: string;
  voice?: string;
  aspect?: string;
  person?: string;
  pronominal_suffix?: string;
}

export interface MorphologyWord {
  form: string;
  tag: string;
  features: {
    [key: string]: any;
  };
}

export interface MorphologyResponse {
  words: MorphologyWord[];
}

export interface WordInfo {
  form: string;
  tag: string;
  lemma?: string;
  root?: string;
  features: { [key: string]: any };
}

export interface VerseResponse {
  chapter: number;
  verse: number;
  words: WordInfo[];
  verse_text?: string;
  translation?: string;
  transliteration?: string;
}
