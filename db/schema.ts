import {
  check,
  foreignKey,
  index,
  integer,
  json,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Existing Supabase tables ---------------------------------------------------

// 若项目实际使用 auth.users，请调整下方 pgTable 定义与外键。
export const users = pgTable('User', {
  id: integer('id').primaryKey(),
})

export const books = pgTable(
  'books',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    wordsCount: integer('words_count').notNull().default(0),
    coverUrl: text('cover_url'),
    bookId: varchar('book_id', { length: 128 }).notNull(),
    tags: text('tags').array(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    bookIdUnique: uniqueIndex('books_book_id_unique').on(table.bookId),
    bookIdIdx: index('idx_books_book_id').on(table.bookId),
  })
)

export const words = pgTable(
  'words',
  {
    wordRank: integer('wordRank').notNull(),
    headWord: text('headWord'),
    content: json('content'),
    bookId: text('bookId'),
  },
  (table) => ({
    bookRankIdx: index('idx_words_book_rank').on(table.bookId, table.wordRank),
    bookIdx: index('idx_words_book').on(table.bookId),
  })
)

// Learning feature tables ----------------------------------------------------

export const wordStatusEnum = pgEnum('word_status', [
  'unknown',
  'learning',
  'known',
])

export const userBookProgress = pgTable(
  'user_book_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id').notNull(),
    bookId: varchar('book_id', { length: 128 }).notNull(),
    lastIndex: integer('last_index').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userBookUnique: uniqueIndex('ubp_user_book_unique').on(
      table.userId,
      table.bookId
    ),
    userUpdatedIdx: index('idx_ubp_user_updated_at').on(
      table.userId,
      table.updatedAt.desc()
    ),
    bookIdx: index('idx_ubp_book').on(table.bookId),
    lastIndexCheck: check(
      'ubp_last_index_nonneg',
      sql`${table.lastIndex} >= 0`
    ),
    userFk: foreignKey({
      name: 'ubp_user_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    bookFk: foreignKey({
      name: 'ubp_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  })
)

export const userWordProgress = pgTable(
  'user_word_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id').notNull(),
    bookId: varchar('book_id', { length: 128 }).notNull(),
    wordRank: integer('word_rank').notNull(),
    status: wordStatusEnum('status').notNull().default('learning'),
    exposures: integer('exposures').notNull().default(0),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    proficiency: smallint('proficiency'),
    easeFactor: real('ease_factor'),
    intervalDays: integer('interval_days'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userBookWordUnique: uniqueIndex('uwp_user_book_word_unique').on(
      table.userId,
      table.bookId,
      table.wordRank
    ),
    userBookIdx: index('idx_uwp_user_book').on(table.userId, table.bookId),
    userStatusIdx: index('idx_uwp_user_status').on(table.userId, table.status),
    dueIdx: index('idx_uwp_due').on(table.userId, table.dueAt),
    wordRankCheck: check('uwp_word_positive', sql`${table.wordRank} > 0`),
    userFk: foreignKey({
      name: 'uwp_user_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    bookFk: foreignKey({
      name: 'uwp_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  })
)

export const learningSessions = pgTable(
  'learning_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id').notNull(),
    bookId: varchar('book_id', { length: 128 }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    wordsSeen: integer('words_seen').notNull().default(0),
    source: varchar('source', { length: 32 }).notNull().default('continue'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      name: 'ls_user_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    bookFk: foreignKey({
      name: 'ls_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    userStartedIdx: index('idx_ls_user_started').on(
      table.userId,
      table.startedAt.desc()
    ),
  })
)

export const events = pgTable(
  'events',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id'),
    bookId: varchar('book_id', { length: 128 }),
    eventType: varchar('event_type', { length: 64 }).notNull(),
    wordRank: integer('word_rank'),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({
      name: 'events_user_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    bookFk: foreignKey({
      name: 'events_book_fk',
      columns: [table.bookId],
      foreignColumns: [books.bookId],
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    userTimeIdx: index('idx_events_user_time').on(
      table.userId,
      table.createdAt.desc()
    ),
    typeTimeIdx: index('idx_events_type_time').on(
      table.eventType,
      table.createdAt.desc()
    ),
  })
)
