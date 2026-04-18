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
  features: MorphologyFeatures;
  original_features?: Record<string, string>;
}

export interface MorphologyResponse {
  chapter?: number;
  verse?: number;
  text?: string;
  words: MorphologyWord[];
  tokens_count?: number;
}
