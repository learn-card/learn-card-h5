import { and, desc, eq } from 'drizzle-orm';

import { db } from './db';
import {
  books,
  userBookProgress,
  userWordProgress,
  words,
} from '../db/schema';
import type { Book, UserProgress, WordDetail } from '../app/types';

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

function parseWordContent(content: any, fallbackHeadWord: string): WordDetail | null {
  if (!content) return null;
  const wordNode = (content.word ?? content) as Record<string, any> | undefined;
  if (!wordNode) return null;
  const wordHead = (wordNode.wordHead ?? content.wordHead ?? fallbackHeadWord) as string;
  if (!wordHead) return null;
  const translationList = (wordNode.trans ?? content.trans ?? []) as WordDetail['trans'];
  const sentences = (wordNode.sentence?.sentences ?? wordNode.sentences ?? content.sentences ?? []) as WordDetail['sentences'];
  return {
    wordRank: Number(content.wordRank ?? wordNode.wordRank ?? 0),
    wordHead,
    ukphone: wordNode.ukphone ?? wordNode.ukPhone ?? undefined,
    usphone: wordNode.usphone ?? wordNode.usPhone ?? undefined,
    ukspeech: wordNode.ukspeech,
    usspeech: wordNode.usspeech,
    trans: translationList ?? [],
    syno: wordNode.syno,
    phrase: wordNode.phrase,
    relWord: wordNode.relWord,
    sentences: sentences ?? [],
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
