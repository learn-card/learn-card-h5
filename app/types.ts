export type AuthMode = 'login' | 'register';

// 原有类型定义保持兼容性
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
  pos?: string;
  tran?: string;
  hwds: string[];
};

export type WordPhrase = {
  phrase: string;
  meaning?: string;
};

export type WordRel = {
  pos?: string;
  words: {
    headWord: string;
    tranCn?: string;
  }[];
};

// 新的content数据结构类型定义
export type ContentTranslation = {
  descCn: string;
  tranCn: string;
  descOther: string;
  tranOther: string;
};

export type ContentSynonym = {
  pos: string;
  hwds: { w: string }[];
  tran: string;
};

export type ContentSyno = {
  desc: string;
  synos: ContentSynonym[];
};

export type ContentPhrase = {
  pCn: string;
  pContent: string;
};

export type ContentPhrases = {
  desc: string;
  phrases: ContentPhrase[];
};

export type ContentRelWord = {
  hwd: string;
  tran: string;
};

export type ContentRel = {
  pos: string;
  words: ContentRelWord[];
};

export type ContentRelWords = {
  desc: string;
  rels: ContentRel[];
};

export type ContentSentence = {
  sCn: string;
  sContent: string;
};

export type ContentSentences = {
  desc: string;
  sentences: ContentSentence[];
};

export type WordContent = {
  syno?: ContentSyno;
  trans?: ContentTranslation[];
  phrase?: ContentPhrases;
  relWord?: ContentRelWords;
  ukphone?: string;
  usphone?: string;
  sentence?: ContentSentences;
  ukspeech?: string;
  usspeech?: string;
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
  // 新增content字段
  content?: WordContent;
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
