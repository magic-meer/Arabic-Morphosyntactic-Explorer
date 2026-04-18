export interface MorphologyWord {
  word: string;
  root: string;
  lemma: string;
  pos: string;
  features: Record<string, string>;
  tag: string;
}

export interface MorphologyAnalysis {
  word: string;
  analysis_count: number;
  top_analysis: MorphologyWord;
  all_analyses: MorphologyWord[];
}

export interface MorphologyResponse {
  verse_id?: number;
  words: MorphologyAnalysis[];
}
