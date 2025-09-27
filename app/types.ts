export type AuthMode = 'login' | 'register';

export type WordTranslation = {
  pos?: string;
  tranCn: string;
  tranOther?: string;
};

export type WordSentence = {
  sContent: string;
  sCn?: string;
};

export type WordSynonym = {
  pos: string;
  tran: string;
  hwds: string[];
};

export type WordPhrase = {
  phrase: string;
  meaning: string;
};

export type WordRel = {
  pos: string;
  words: {
    headWord: string;
    tranCn: string;
  }[];
};

export type WordDetail = {
  wordRank: number;
  wordHead: string;
  ukphone?: string;
  usphone?: string;
  ukspeech?: string;
  usspeech?: string;
  trans: WordTranslation[];
  syno?: WordSynonym[];
  phrase?: WordPhrase[];
  relWord?: WordRel[];
  sentences?: WordSentence[];
};

export type Book = {
  id: string;
  bookId: string;
  title: string;
  wordsCount: number;
  coverUrl: string | null;
  tags: string[] | null;
  description?: string | null;
};

export type UserProgress = {
  bookId: string;
  lastIndex: number;
  learnedWords: number;
  updatedAt: string;
  wordsCount?: number;
};

export type UserSummary = {
  id: string;
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  learnedBooks: number;
  learnedWords: number;
  progress: UserProgress[];
};
