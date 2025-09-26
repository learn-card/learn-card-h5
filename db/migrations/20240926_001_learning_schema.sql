-- Learning feature schema for Supabase (Users/words/books already exist)

create extension if not exists pgcrypto;

-- Harden existing dictionary tables ---------------------------------------

create index if not exists idx_words_book_rank
  on public.words ("bookId", "wordRank");

create index if not exists idx_words_book
  on public.words ("bookId");

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'words_book_fk'
      and conrelid = 'public.words'::regclass
  ) then
    alter table public.words
      add constraint words_book_fk
        foreign key ("bookId") references public.books(book_id)
        on update cascade on delete cascade;
  end if;
end $$;

create index if not exists idx_books_book_id
  on public.books (book_id);

-- Enum type for word mastery ------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'word_status'
      and typnamespace = 'public'::regnamespace
  ) then
    create type public.word_status as enum ('unknown', 'learning', 'known');
  end if;
end $$;

-- Learning progress tables --------------------------------------------------

create table if not exists public.user_book_progress (
  id uuid primary key default gen_random_uuid(),
  user_id integer not null,
  book_id varchar(128) not null,
  last_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ubp_user_book_unique unique (user_id, book_id),
  constraint ubp_last_index_nonneg check (last_index >= 0),
  constraint ubp_user_fk foreign key (user_id) references public."User"(id)
    on update cascade on delete cascade,
  constraint ubp_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete cascade
);

create index if not exists idx_ubp_user_updated_at
  on public.user_book_progress (user_id, updated_at desc);

create index if not exists idx_ubp_book
  on public.user_book_progress (book_id);

create table if not exists public.user_word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id integer not null,
  book_id varchar(128) not null,
  word_rank integer not null,
  status public.word_status not null default 'learning',
  exposures integer not null default 0,
  first_seen_at timestamptz null,
  last_seen_at timestamptz null,
  proficiency smallint null,
  ease_factor real null,
  interval_days integer null,
  due_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uwp_user_book_word_unique unique (user_id, book_id, word_rank),
  constraint uwp_word_positive check (word_rank > 0),
  constraint uwp_user_fk foreign key (user_id) references public."User"(id)
    on update cascade on delete cascade,
  constraint uwp_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete cascade
);

create index if not exists idx_uwp_user_book
  on public.user_word_progress (user_id, book_id);

create index if not exists idx_uwp_user_status
  on public.user_word_progress (user_id, status);

create index if not exists idx_uwp_due
  on public.user_word_progress (user_id, due_at);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id integer not null,
  book_id varchar(128) not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz null,
  words_seen integer not null default 0,
  source varchar(32) not null default 'continue',
  created_at timestamptz not null default now(),
  constraint ls_user_fk foreign key (user_id) references public."User"(id)
    on update cascade on delete cascade,
  constraint ls_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete cascade
);

create index if not exists idx_ls_user_started
  on public.learning_sessions (user_id, started_at desc);

create table if not exists public.events (
  id serial primary key,
  user_id integer null,
  book_id varchar(128) null,
  event_type varchar(64) not null,
  word_rank integer null,
  payload jsonb null,
  created_at timestamptz not null default now(),
  constraint events_user_fk foreign key (user_id) references public."User"(id)
    on update cascade on delete set null,
  constraint events_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete set null
);

create index if not exists idx_events_user_time
  on public.events (user_id, created_at desc);

create index if not exists idx_events_type_time
  on public.events (event_type, created_at desc);
