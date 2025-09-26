## 学习卡片技术方案与数据表设计（tech）

本文档基于 PRD（见 `doc/prd.md`）与现有数据表（`public.words`、`public.books`）制定用户学习功能的数据表设计与技术要点，包含：表结构、约束/索引、接口到 SQL 的映射、数据流与迁移建议。

注意：文中用户表以 `public.users(id uuid)` 为例，如果现有认证系统的用户表或 schema 名称不同，请按实际替换（保持字段与约束一致即可）。


### 1. 现有表（作为上下文）

- `public.words`
  - 用途：存储单词词条与原始 JSON 内容，按“单词书 + 排序位次（wordRank）”组织。
  - 现有定义：
    ```sql
    create table public.words (
      "wordRank" integer not null,
      "headWord" text null,
      content json null,
      "bookId" text null
    ) TABLESPACE pg_default;
    ```
  - 建议补充约束/索引（非破坏性）：
    ```sql
    -- 每本书内的排序唯一，便于 O(1) 按索引取词
    alter table public.words
      add constraint words_book_rank_unique unique ("bookId", "wordRank");

    create index if not exists idx_words_book on public.words("bookId");
    ```

- `public.books`
  - 用途：存储单词书元信息。
  - 现有定义：
    ```sql
    create table public.books (
      id uuid not null default gen_random_uuid (),
      title character varying(255) not null,
      words_count integer not null default 0,
      cover_url text null,
      book_id character varying(128) not null,
      tags text[] null,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now(),
      constraint books_pkey primary key (id),
      constraint books_book_id_unique unique (book_id)
    ) TABLESPACE pg_default;
    ```
  - 建议补充：
    ```sql
    -- words.bookId → books.book_id 的外键（可选：若历史数据不全，可先跳过）
    alter table public.words
      add constraint words_book_fk
      foreign key ("bookId") references public.books(book_id)
      on update cascade on delete cascade;

    create index if not exists idx_books_book_id on public.books(book_id);
    ```


### 2. 新增表设计（满足 PRD 学习功能）

#### 2.1 用户-书籍学习进度表：user_book_progress
- 目标：满足 PRD 5.1/5.2 对“最近学习、继续学习、记录最后索引”的需求。
- 说明：应用内统一使用“0 基索引”。`words.wordRank` 若为 1 基，则以 `word_index = wordRank - 1` 与之对应。

```sql
create table if not exists public.user_book_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  book_id varchar(128) not null,
  -- 最近学习到的 0 基索引（进入“继续学习”时从 last_index + 1 开始）
  last_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ubp_user_fk foreign key (user_id) references public.users(id)
    on update cascade on delete cascade,
  constraint ubp_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete cascade,
  constraint ubp_user_book_unique unique (user_id, book_id),
  constraint ubp_last_index_nonneg check (last_index >= 0)
);

create index if not exists idx_ubp_user_updated_at
  on public.user_book_progress(user_id, updated_at desc);
create index if not exists idx_ubp_book on public.user_book_progress(book_id);
```

- 用法要点：
  - “继续学习”：`select last_index from user_book_progress where user_id = $1 and book_id = $2`，进入 `next_index = last_index + 1`。
  - “最近学习”：按 `updated_at desc` 取 Top N，再 join `books` 显示封面与标题。


#### 2.2 用户-单词粒度进度表：user_word_progress（预留 SRS 能力）
- 目标：记录用户在某本书中某个单词的掌握度与最近学习足迹，支持“已学习单词数”统计与后续的间隔重复（SRS）扩展。
- 现阶段最小可用字段：`status/exposures/last_seen_at`。其余字段为可选（可空）。

```sql
create type public.word_status as enum ('unknown', 'learning', 'known');

create table if not exists public.user_word_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  book_id varchar(128) not null,
  -- 与 public.words."wordRank" 对应（1 基），也可冗余存 0 基索引以便应用层使用
  word_rank integer not null,

  status public.word_status not null default 'learning',
  exposures integer not null default 0,           -- 累计曝光（查看/下一张）
  first_seen_at timestamptz null,
  last_seen_at timestamptz null,

  -- 预留 SRS 能力（当前可为空不用）：
  proficiency smallint null,                      -- 0..5 等级或自定义刻度
  ease_factor real null,                          -- 简化 SM-2 参数
  interval_days integer null,                     -- 当前间隔（天）
  due_at timestamptz null,                        -- 下次复习时间

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uwp_user_fk foreign key (user_id) references public.users(id)
    on update cascade on delete cascade,
  constraint uwp_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete cascade,
  constraint uwp_word_fk check (word_rank > 0),
  constraint uwp_user_book_word_unique unique (user_id, book_id, word_rank)
);

create index if not exists idx_uwp_user_book on public.user_word_progress(user_id, book_id);
create index if not exists idx_uwp_user_status on public.user_word_progress(user_id, status);
create index if not exists idx_uwp_due on public.user_word_progress(user_id, due_at);
```

- 用法要点：
  - 统计“已学习单词数”：`count(*) where status in ('learning','known')`（或仅 `known`）。
  - 学习页“下一张”时：`exposures += 1, last_seen_at = now()`，必要时推进 `status`。


#### 2.3 学习会话表（可选）：learning_sessions
- 目的：用于运营/分析与“连续学习（时长/次数）”等功能，不是 PRD 强制，但对后续拓展有价值。

```sql
create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  book_id varchar(128) not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz null,
  words_seen integer not null default 0,
  source varchar(32) not null default 'continue', -- 例如：'continue' | 'first' | 'direct'

  constraint ls_user_fk foreign key (user_id) references public.users(id)
    on update cascade on delete cascade,
  constraint ls_book_fk foreign key (book_id) references public.books(book_id)
    on update cascade on delete cascade
);

create index if not exists idx_ls_user_started on public.learning_sessions(user_id, started_at desc);
```


#### 2.4 行为埋点表（可选，与 PRD 第 8 节对应）：events
- 目的：记录关键事件，辅助问题定位与行为分析。也可替换为外部埋点系统。

```sql
create table if not exists public.events (
  id bigserial primary key,
  user_id uuid null,                 -- 未登录可为空
  book_id varchar(128) null,
  event_type varchar(64) not null,   -- open_app/view_home/...（与 PRD 枚举一致）
  word_rank integer null,
  payload jsonb null,                -- 其他上下文字段（来源页等）
  created_at timestamptz not null default now()
);

create index if not exists idx_events_user_time on public.events(user_id, created_at desc);
create index if not exists idx_events_type_time on public.events(event_type, created_at desc);
```


### 3. 字段与规则对齐（与 PRD 的对应关系）

- 0 基索引：
  - PRD 中 `Progress.lastIndex` 为 0 基；数据库中 `public.words."wordRank"` 通常为 1 基。
  - 约定：应用层将 `index` 与 `wordRank` 互转：`wordRank = index + 1`。
- 最近学习：
  - 来自 `user_book_progress.updated_at` 倒序；取 Top N（例如 3）。
- 进度写入：
  - “下一张”后：`update user_book_progress set last_index = $index, updated_at = now()`；
  - 若无记录则 UPSERT（见 4.1 示例）。
- 进度汇总（我的页）：
  - 已学习书本数：`count(distinct book_id) from user_book_progress where user_id = $uid`；
  - 已学习单词数：`count(*) from user_word_progress where user_id = $uid and status in ('learning','known')`（或仅 `known`）。


### 4. 接口到 SQL 的映射（关键路径）

#### 4.1 记录进度：`POST /api/learn/progress` → UPSERT
```sql
insert into public.user_book_progress(user_id, book_id, last_index)
values ($1, $2, $3)
on conflict (user_id, book_id)
  do update set last_index = excluded.last_index,
                updated_at = now();
```
- 可选同时写入 `user_word_progress`：
```sql
insert into public.user_word_progress(user_id, book_id, word_rank, status, exposures, first_seen_at, last_seen_at)
values ($1, $2, $3 + 1, 'learning', 1, now(), now())
on conflict (user_id, book_id, word_rank)
  do update set exposures = public.user_word_progress.exposures + 1,
                last_seen_at = now(),
                updated_at = now();
```

#### 4.2 最近学习：`GET /api/user/recent`
```sql
select b.book_id, b.title, b.cover_url, b.words_count,
       p.last_index, p.updated_at
from public.user_book_progress p
join public.books b on b.book_id = p.book_id
where p.user_id = $1
order by p.updated_at desc
limit $2;  -- N = 3
```

#### 4.3 取第 x 个单词：`GET /api/books/:id/word?index=x`
```sql
select w."wordRank", w."headWord", w.content
from public.words w
where w."bookId" = $1 and w."wordRank" = $2 + 1
limit 1;
```


### 5. 约束、索引与一致性

- 外键一致性：
  - `words.bookId` → `books.book_id`；
  - 所有新增表中的 `book_id` 外键指向 `books.book_id`，`user_id` 指向 `users.id`。
- 唯一性：
  - `words(bookId, wordRank)` 唯一；
  - `user_book_progress(user_id, book_id)` 唯一；
  - `user_word_progress(user_id, book_id, word_rank)` 唯一。
- 性能索引：
  - 近期列表：`user_book_progress(user_id, updated_at desc)`；
  - 词条定位：`words(bookId, wordRank)` 唯一索引即覆盖；
  - 统计/复习：`user_word_progress(user_id, status)`、`(user_id, due_at)`。
- 时间戳维护：
  - 若需要数据库层自动维护 `updated_at`，可增加触发器：
    ```sql
    create or replace function set_updated_at()
    returns trigger as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$ language plpgsql;

    create trigger trg_ubp_updated before update on public.user_book_progress
    for each row execute function set_updated_at();

    create trigger trg_uwp_updated before update on public.user_word_progress
    for each row execute function set_updated_at();
    ```


### 6. 数据流与边界情况

- 首次进入某书学习：
  - 若无 `user_book_progress` 记录，前端从 index=0 取词；提交下一张时 UPSERT 新纪录。
- 继续学习：
  - 读取 `last_index`，尝试加载 `index = last_index + 1`；若 `index >= words_count`，提示“已学完”。
- 上一张：
  - 不更新 `last_index`（仅在“下一张”时更新）。
- 删除书籍或用户：
  - 外键 `on delete cascade` 会清理相关进度与会话记录。


### 7. 迁移与回填建议

- 增量上线：
  - 先创建新增表与索引，不影响现有读写；
  - 若历史 `words` 未满足唯一约束，先数据清洗再加约束；
  - 外键可分阶段启用（先仅索引，后置外键）。
- 数据回填：
  - 如已有前端埋点或旧进度数据，可脚本批量导入 `user_book_progress` 与 `user_word_progress`。


### 8. 未来扩展（非本期必做）

- 完整 SRS 流程：按 `user_word_progress` 的 `due_at` 推单词队列；
- 书内自定义学习范围（分单元/章节）：新增 `book_units` 表及 `words` 与单元映射；
- 收藏/标注难词：在 `user_word_progress` 增加 `is_starred`/`notes`；
- 设备离线：本地缓存 + 在线合并策略（以 `updated_at` 为准做冲突解决）。


— 完 —
