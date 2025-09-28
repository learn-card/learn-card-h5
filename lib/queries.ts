import { and, desc, eq } from 'drizzle-orm';

import { db } from './db';
import {
  books,
  userBookProgress,
  userWordProgress,
  words,
} from '../db/schema';
import type {
  Book,
  UserProgress,
  WordDetail,
  WordPhrase,
  WordRel,
  WordSentence,
  WordSynonym,
  WordTranslation,
} from '../app/types';

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeTranslations(input: any): WordTranslation[] {
  return toArray(input)
    .map((item) => {
      if (!item) return null;
      const pos =
        item.pos ??
        item.posEn ??
        item.posCn ??
        item.partOfSpeech ??
        item.partOfSpeechEn ??
        item.partOfSpeechCn;
      const tranCn =
        item.tranCn ??
        item.tranCN ??
        item.tran ??
        item.descCn ??
        item.descCN ??
        item.meaning ??
        '';
      const tranOther =
        item.tranOther ??
        item.tranEn ??
        item.tranEN ??
        item.descOther ??
        item.desc ??
        item.definition ??
        undefined;
      if (!tranCn && !tranOther) return null;
      return {
        pos: typeof pos === 'string' && pos.trim().length > 0 ? pos : undefined,
        tranCn: tranCn || (tranOther ?? ''),
        tranOther:
          typeof tranOther === 'string' && tranOther.trim().length > 0
            ? tranOther
            : undefined,
      } satisfies WordTranslation;
    })
    .filter(Boolean) as WordTranslation[];
}

function normalizeSynonyms(input: any): WordSynonym[] {
  const candidates = input?.synos ?? input;
  return toArray(candidates)
    .map((item) => {
      if (!item) return null;
      const hwdsRaw = toArray(item.hwds ?? item.words);
      const hwds = hwdsRaw
        .map((word) => {
          if (!word) return null;
          if (typeof word === 'string') return word;
          if (typeof word.w === 'string') return word.w;
          if (typeof word.word === 'string') return word.word;
          return null;
        })
        .filter((value): value is string => Boolean(value && value.trim().length > 0));
      const tran = item.tran ?? item.tranCn ?? item.meaning ?? '';
      if (hwds.length === 0 && !tran) return null;
      return {
        pos: item.pos ?? item.posCn ?? item.posEn ?? '',
        tran,
        hwds,
      } satisfies WordSynonym;
    })
    .filter(Boolean) as WordSynonym[];
}

function normalizePhrases(input: any): WordPhrase[] {
  const source = input?.phrases ?? input;
  return toArray(source)
    .map((item) => {
      if (!item) return null;
      const phrase = item.pContent ?? item.phrase ?? item.content ?? '';
      const meaning = item.pCn ?? item.meaning ?? item.translation ?? '';
      if (!phrase && !meaning) return null;
      return {
        phrase,
        meaning,
      } satisfies WordPhrase;
    })
    .filter(Boolean) as WordPhrase[];
}

function normalizeRelWords(input: any): WordRel[] {
  const rels = input?.rels ?? input;
  return toArray(rels)
    .map((item) => {
      if (!item) return null;
      const words = toArray(item.words)
        .map((word) => {
          if (!word) return null;
          const headWord =
            word.hwd ?? word.headWord ?? word.word ?? word.content ?? '';
          const tranCn = word.tran ?? word.tranCn ?? word.meaning ?? '';
          if (!headWord && !tranCn) return null;
          return {
            headWord,
            tranCn,
          } satisfies WordRel['words'][number];
        })
        .filter(
          (value): value is WordRel['words'][number] =>
            Boolean(value && (value.headWord || value.tranCn))
        );
      if (words.length === 0) return null;
      return {
        pos: item.pos ?? item.posCn ?? item.posEn ?? '',
        words,
      } satisfies WordRel;
    })
    .filter(Boolean) as WordRel[];
}

function normalizeSentences(input: any): WordSentence[] {
  return toArray(input)
    .map((item) => {
      if (!item) return null;
      const content =
        item.sContent ?? item.content ?? item.en ?? item.example ?? '';
      const cn = item.sCn ?? item.cn ?? item.translation ?? undefined;
      if (!content && !cn) return null;
      return {
        sContent: content,
        sCn: cn,
      } satisfies WordSentence;
    })
    .filter(Boolean) as WordSentence[];
}

export async function fetchBooks(): Promise<Book[]> {
  const rows = await db.select().from(books).orderBy(desc(books.updatedAt));
  return rows.map((row) => ({
    id: row.id,
    bookId: row.bookId,
    title: row.title,
    wordsCount: row.wordsCount,
    coverUrl: row.coverUrl,
    tags: row.tags,
    description: null,
  }));
}

function parseWordContent(rawContent: any, fallbackHeadWord: string): WordDetail | null {
  if (!rawContent) return null;
  let content = rawContent;
  if (typeof content === 'string') {
    try {
      content = JSON.parse(content);
    } catch (error) {
      console.warn('Failed to parse word content', error);
      return null;
    }
  }

  const wordNode = (content.word ?? content) as Record<string, any> | undefined;
  if (!wordNode) return null;

  const wordHead = (wordNode.wordHead ?? content.wordHead ?? fallbackHeadWord) as string;
  if (!wordHead) return null;

  const translations = normalizeTranslations(
    wordNode.trans ?? content.trans ?? wordNode.translation
  );
  const synonymList = normalizeSynonyms(wordNode.syno ?? content.syno);
  const phraseList = normalizePhrases(wordNode.phrase ?? content.phrase);
  const relWords = normalizeRelWords(wordNode.relWord ?? content.relWord);
  const sentences = normalizeSentences(
    wordNode.sentence?.sentences ??
      wordNode.sentences ??
      content.sentence?.sentences ??
      content.sentences
  );

  return {
    wordRank: Number(content.wordRank ?? wordNode.wordRank ?? 0),
    wordHead,
    ukphone:
      wordNode.ukphone ?? wordNode.ukPhone ?? content.ukphone ?? content.ukPhone,
    usphone:
      wordNode.usphone ?? wordNode.usPhone ?? content.usphone ?? content.usPhone,
    ukspeech: wordNode.ukspeech ?? content.ukspeech,
    usspeech: wordNode.usspeech ?? content.usspeech,
    trans: translations,
    syno: synonymList,
    phrase: phraseList,
    relWord: relWords,
    sentences,
  };
}

export async function fetchBookWords(bookId: string): Promise<WordDetail[]> {
  const rows = await db
    .select({
      wordRank: words.wordRank,
      headWord: words.headWord,
      content: words.content,
    })
    .from(words)
    .where(eq(words.bookId, bookId))
    .orderBy(words.wordRank)
    .limit(500);

  return rows
    .map((row) => {
      const parsed = parseWordContent(row.content, row.headWord ?? '');
      if (!parsed) return null;
      return {
        ...parsed,
        wordRank: row.wordRank,
      };
    })
    .filter((item): item is WordDetail => Boolean(item));
}

export async function fetchUserProgress(userId: number): Promise<UserProgress[]> {
  const rows = await db
    .select({
      bookId: userBookProgress.bookId,
      lastIndex: userBookProgress.lastIndex,
      updatedAt: userBookProgress.updatedAt,
      wordsCount: books.wordsCount,
    })
    .from(userBookProgress)
    .innerJoin(books, eq(userBookProgress.bookId, books.bookId))
    .where(eq(userBookProgress.userId, userId))
    .orderBy(desc(userBookProgress.updatedAt));

  if (rows.length === 0) return [];

  const learnedRows = await db
    .select({
      bookId: userWordProgress.bookId,
      count: userWordProgress.wordRank,
    })
    .from(userWordProgress)
    .where(and(eq(userWordProgress.userId, userId), eq(userWordProgress.status, 'known')));

  return rows.map((row) => {
    const learnedCount = learnedRows.filter((item) => item.bookId === row.bookId).length;
    return {
      bookId: row.bookId,
      lastIndex: row.lastIndex,
      learnedWords: learnedCount,
      updatedAt: row.updatedAt.toISOString(),
      wordsCount: row.wordsCount ?? undefined,
    };
  });
}
