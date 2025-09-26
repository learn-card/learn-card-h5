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
  coverUrl: string;
  tags: string[];
  description: string;
};

export type UserProgress = {
  bookId: string;
  lastIndex: number;
  learnedWords: number;
  updatedAt: string;
  wordsCount?: number;
};

export type MockUser = {
  email: string;
  displayName: string;
  avatarUrl: string;
  learnedBooks: number;
  learnedWords: number;
  progress: UserProgress[];
};

export const mockBooks: Book[] = [
  {
    id: '1',
    bookId: 'cet4',
    title: '大学英语四级核心词汇',
    wordsCount: 821,
    coverUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
    tags: ['基础', '考试'],
    description:
      '精选四级必背单词，配备例句与发音，帮助夯实英语基础。',
  },
  {
    id: '2',
    bookId: 'cet6',
    title: '大学英语六级核心词汇',
    wordsCount: 934,
    coverUrl:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    tags: ['进阶', '考试'],
    description:
      '覆盖六级高频词汇与语境应用，提升听说读写能力。',
  },
  {
    id: '3',
    bookId: 'ielts',
    title: '雅思核心词汇精讲',
    wordsCount: 670,
    coverUrl:
      'https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=600&q=80',
    tags: ['雅思', '留学'],
    description:
      '覆盖听说读写全场景，例句贴近真实考试情境。',
  },
  {
    id: '4',
    bookId: 'toefl',
    title: '托福高频词汇',
    wordsCount: 712,
    coverUrl:
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80',
    tags: ['托福', '北美'],
    description:
      '聚焦托福核心词汇，提供丰富搭配与常见考点提示。',
  },
  {
    id: '5',
    bookId: 'sat',
    title: 'SAT 高频词汇',
    wordsCount: 560,
    coverUrl:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80',
    tags: ['SAT', '高中'],
    description:
      '面向北美高中生，精选考试常见词汇及写作必备表达。',
  },
  {
    id: '6',
    bookId: 'business',
    title: '商务英语词汇',
    wordsCount: 432,
    coverUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
    tags: ['职场', '商务'],
    description:
      '涵盖会议、邮件、谈判等商务场景词汇，实用性极强。',
  },
];

export const mockWords: Record<string, WordDetail[]> = {
  cet4: [
    {
      wordRank: 1,
      wordHead: 'accompany',
      ukphone: "ə'kʌmpəni",
      usphone: 'əˈkʌmpəni',
      trans: [
        {
          pos: 'v.',
          tranCn: '陪伴；伴随',
          tranOther: 'to go somewhere with someone',
        },
      ],
      sentences: [
        {
          sContent: 'She accompanied her friend to the airport.',
          sCn: '她陪朋友去机场。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'go with; escort',
          hwds: ['escort', 'attend', 'follow'],
        },
      ],
      phrase: [
        {
          phrase: 'accompany with',
          meaning: '以……伴奏；伴随',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'accompaniment',
              tranCn: '伴奏；伴随物',
            },
          ],
        },
      ],
    },
    {
      wordRank: 2,
      wordHead: 'accurate',
      ukphone: "'ækjərət",
      usphone: 'ˈækjərət',
      trans: [
        {
          pos: 'adj.',
          tranCn: '准确的；精确的',
          tranOther: 'correct and exact in all details',
        },
      ],
      sentences: [
        {
          sContent: 'The report provides an accurate description of the event.',
          sCn: '报告对事件做出了准确的描述。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'correct; precise',
          hwds: ['precise', 'exact', 'right'],
        },
      ],
      phrase: [
        {
          phrase: 'accurate data',
          meaning: '准确数据',
        },
      ],
      relWord: [
        {
          pos: 'adv.',
          words: [
            {
              headWord: 'accurately',
              tranCn: '准确地；精确地',
            },
          ],
        },
      ],
    },
    {
      wordRank: 3,
      wordHead: 'acknowledge',
      ukphone: 'əkˈnɒlɪdʒ',
      usphone: 'əkˈnɑːlɪdʒ',
      trans: [
        {
          pos: 'v.',
          tranCn: '承认；答谢',
          tranOther: 'to accept that something is true or real',
        },
      ],
      sentences: [
        {
          sContent: 'He acknowledged his mistake immediately.',
          sCn: '他立刻承认了自己的错误。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'admit; recognize',
          hwds: ['admit', 'recognize', 'grant'],
        },
      ],
      phrase: [
        {
          phrase: 'acknowledge receipt',
          meaning: '确认收到',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'acknowledgement',
              tranCn: '承认；感谢',
            },
          ],
        },
      ],
    },
    {
      wordRank: 4,
      wordHead: 'adapt',
      ukphone: 'əˈdæpt',
      usphone: 'əˈdæpt',
      trans: [
        {
          pos: 'v.',
          tranCn: '适应；改编',
          tranOther: 'to change something to suit a new purpose or situation',
        },
      ],
      sentences: [
        {
          sContent: 'It took him a while to adapt to the new environment.',
          sCn: '他过了一段时间才适应新的环境。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'adjust; modify',
          hwds: ['adjust', 'alter', 'accommodate'],
        },
      ],
      phrase: [
        {
          phrase: 'adapt to',
          meaning: '适应；顺应',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'adaptation',
              tranCn: '适应；改编本',
            },
          ],
        },
      ],
    },
    {
      wordRank: 5,
      wordHead: 'adventure',
      ukphone: 'ədˈventʃə',
      usphone: 'ədˈventʃər',
      trans: [
        {
          pos: 'n.',
          tranCn: '冒险；奇遇',
          tranOther: 'an unusual and exciting or daring experience',
        },
      ],
      sentences: [
        {
          sContent: 'They went on an adventure into the mountains.',
          sCn: '他们到山里探险。',
        },
      ],
      syno: [
        {
          pos: 'noun',
          tran: 'excursion; exploration',
          hwds: ['experience', 'venture', 'escapade'],
        },
      ],
      phrase: [
        {
          phrase: 'adventure story',
          meaning: '冒险故事',
        },
      ],
      relWord: [
        {
          pos: 'adj.',
          words: [
            {
              headWord: 'adventurous',
              tranCn: '爱冒险的；大胆的',
            },
          ],
        },
      ],
    },
  ],
  cet6: [
    {
      wordRank: 1,
      wordHead: 'aggregate',
      ukphone: "'ægrɪgət",
      usphone: 'ˈæɡrɪɡət',
      trans: [
        {
          pos: 'adj.',
          tranCn: '总计的；合计的',
        },
        {
          pos: 'n.',
          tranCn: '总数；合计',
        },
        {
          pos: 'v.',
          tranCn: '合计；聚集',
        },
      ],
      sentences: [
        {
          sContent: 'The aggregate cost of the project exceeded our budget.',
          sCn: '项目的总成本超出了预算。',
        },
      ],
      syno: [
        {
          pos: 'noun',
          tran: 'total; sum',
          hwds: ['sum', 'whole', 'collection'],
        },
      ],
      phrase: [
        {
          phrase: 'in the aggregate',
          meaning: '总共；总计',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'aggregation',
              tranCn: '聚合；集合体',
            },
          ],
        },
      ],
    },
    {
      wordRank: 2,
      wordHead: 'alleviate',
      ukphone: 'əˈliːvieɪt',
      usphone: 'əˈliːvieɪt',
      trans: [
        {
          pos: 'v.',
          tranCn: '减轻；缓和',
          tranOther: 'to make something less severe or painful',
        },
      ],
      sentences: [
        {
          sContent: 'This medicine will help alleviate the pain.',
          sCn: '这种药可以缓解疼痛。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'ease; relieve',
          hwds: ['ease', 'mitigate', 'soothe'],
        },
      ],
      phrase: [
        {
          phrase: 'alleviate suffering',
          meaning: '减轻痛苦',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'alleviation',
              tranCn: '缓和；减轻',
            },
          ],
        },
      ],
    },
    {
      wordRank: 3,
      wordHead: 'ambiguous',
      ukphone: 'æmˈbɪɡjuəs',
      usphone: 'æmˈbɪɡjuəs',
      trans: [
        {
          pos: 'adj.',
          tranCn: '模棱两可的；含糊的',
          tranOther: 'having more than one possible meaning',
        },
      ],
      sentences: [
        {
          sContent: 'His reply was ambiguous and left us confused.',
          sCn: '他的回答模棱两可，让我们困惑。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'unclear; vague',
          hwds: ['uncertain', 'vague', 'equivocal'],
        },
      ],
      phrase: [
        {
          phrase: 'ambiguous statement',
          meaning: '含糊其辞',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'ambiguity',
              tranCn: '模糊；含糊',
            },
          ],
        },
      ],
    },
    {
      wordRank: 4,
      wordHead: 'anticipate',
      ukphone: "æn'tɪsɪpeɪt",
      usphone: "æn'tɪsɪpeɪt",
      trans: [
        {
          pos: 'v.',
          tranCn: '预期；预料',
          tranOther: 'to expect that something will happen and prepare for it',
        },
      ],
      sentences: [
        {
          sContent: 'We anticipate that sales will increase this quarter.',
          sCn: '我们预期本季度的销售额将会上升。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'expect; foresee',
          hwds: ['expect', 'predict', 'foresee'],
        },
      ],
      phrase: [
        {
          phrase: 'anticipate needs',
          meaning: '预见需求',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'anticipation',
              tranCn: '预期；预料',
            },
          ],
        },
      ],
    },
    {
      wordRank: 5,
      wordHead: 'appraise',
      ukphone: 'əˈpreɪz',
      usphone: 'əˈpreɪz',
      trans: [
        {
          pos: 'v.',
          tranCn: '评估；评价',
          tranOther: 'to assess the value or quality of something',
        },
      ],
      sentences: [
        {
          sContent: 'An expert was called to appraise the painting.',
          sCn: '请来了一位专家评估那幅画的价值。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'evaluate; assess',
          hwds: ['evaluate', 'assess', 'estimate'],
        },
      ],
      phrase: [
        {
          phrase: 'performance appraise',
          meaning: '绩效评估',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'appraisal',
              tranCn: '评价；鉴定',
            },
          ],
        },
      ],
    },
  ],
  ielts: [
    {
      wordRank: 1,
      wordHead: 'articulate',
      ukphone: 'ɑːˈtɪkjʊlət',
      usphone: 'ɑːrˈtɪkjʊlət',
      trans: [
        {
          pos: 'adj.',
          tranCn: '善于表达的；口齿清晰的',
        },
        {
          pos: 'v.',
          tranCn: '清楚地表达',
        },
      ],
      sentences: [
        {
          sContent: 'He is an articulate speaker who captivates the audience.',
          sCn: '他是个口齿伶俐的演讲者，能吸引听众。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'expressive; eloquent',
          hwds: ['eloquent', 'fluent', 'coherent'],
        },
      ],
      phrase: [
        {
          phrase: 'articulate ideas',
          meaning: '清楚地表达观点',
        },
      ],
      relWord: [
        {
          pos: 'adv.',
          words: [
            {
              headWord: 'articulately',
              tranCn: '清晰地；善于表达地',
            },
          ],
        },
      ],
    },
    {
      wordRank: 2,
      wordHead: 'assimilate',
      ukphone: 'əˈsɪmɪleɪt',
      usphone: 'əˈsɪməleɪt',
      trans: [
        {
          pos: 'v.',
          tranCn: '吸收；同化',
        },
      ],
      sentences: [
        {
          sContent: 'Immigrants often take years to assimilate into a new culture.',
          sCn: '移民通常需要多年才能融入新的文化。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'absorb; integrate',
          hwds: ['absorb', 'integrate', 'adapt'],
        },
      ],
      phrase: [
        {
          phrase: 'assimilate knowledge',
          meaning: '吸收知识',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'assimilation',
              tranCn: '吸收；同化',
            },
          ],
        },
      ],
    },
    {
      wordRank: 3,
      wordHead: 'authentic',
      ukphone: 'ɔːˈθentɪk',
      usphone: 'ɔːˈθentɪk',
      trans: [
        {
          pos: 'adj.',
          tranCn: '真实的；正宗的',
        },
      ],
      sentences: [
        {
          sContent: 'You can find authentic British cuisine in this restaurant.',
          sCn: '在这家餐厅可以品尝到地道的英式菜肴。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'genuine; real',
          hwds: ['genuine', 'real', 'true'],
        },
      ],
      phrase: [
        {
          phrase: 'authentic experience',
          meaning: '真实体验',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'authenticity',
              tranCn: '真实性；可靠性',
            },
          ],
        },
      ],
    },
    {
      wordRank: 4,
      wordHead: 'benchmark',
      ukphone: 'ˈbentʃmɑːk',
      usphone: 'ˈbentʃmɑːrk',
      trans: [
        {
          pos: 'n.',
          tranCn: '基准；衡量标准',
        },
        {
          pos: 'v.',
          tranCn: '以……为基准',
        },
      ],
      sentences: [
        {
          sContent: 'The score serves as a benchmark for future exams.',
          sCn: '该分数作为未来考试的基准。',
        },
      ],
      syno: [
        {
          pos: 'noun',
          tran: 'standard; yardstick',
          hwds: ['standard', 'criterion', 'measure'],
        },
      ],
      phrase: [
        {
          phrase: 'benchmark test',
          meaning: '基准测试',
        },
      ],
      relWord: [
        {
          pos: 'v.',
          words: [
            {
              headWord: 'benchmarking',
              tranCn: '标杆管理；追赶学习',
            },
          ],
        },
      ],
    },
    {
      wordRank: 5,
      wordHead: 'coherent',
      ukphone: 'kəʊˈhɪərənt',
      usphone: 'koʊˈhɪrənt',
      trans: [
        {
          pos: 'adj.',
          tranCn: '连贯的；条理清晰的',
        },
      ],
      sentences: [
        {
          sContent: 'Her presentation was coherent and persuasive.',
          sCn: '她的演讲连贯有力。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'logical; consistent',
          hwds: ['logical', 'consistent', 'orderly'],
        },
      ],
      phrase: [
        {
          phrase: 'coherent argument',
          meaning: '言之成理的论点',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'coherence',
              tranCn: '连贯性；一致性',
            },
          ],
        },
      ],
    },
  ],
  toefl: [
    {
      wordRank: 1,
      wordHead: 'allocate',
      ukphone: 'ˈæləkeɪt',
      usphone: 'ˈæləˌkeɪt',
      trans: [
        {
          pos: 'v.',
          tranCn: '分配；拨给',
        },
      ],
      sentences: [
        {
          sContent: 'Resources were allocated to the most urgent cases.',
          sCn: '资源被分配给最紧急的情况。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'assign; distribute',
          hwds: ['assign', 'distribute', 'apportion'],
        },
      ],
      phrase: [
        {
          phrase: 'allocate funds',
          meaning: '拨款',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'allocation',
              tranCn: '分配；配给',
            },
          ],
        },
      ],
    },
    {
      wordRank: 2,
      wordHead: 'analogy',
      ukphone: 'əˈnælədʒi',
      usphone: 'əˈnælədʒi',
      trans: [
        {
          pos: 'n.',
          tranCn: '类比；相似',
        },
      ],
      sentences: [
        {
          sContent: 'The teacher used an analogy to explain the concept.',
          sCn: '老师用类比来解释这个概念。',
        },
      ],
      syno: [
        {
          pos: 'noun',
          tran: 'comparison; similarity',
          hwds: ['comparison', 'parallel', 'likeness'],
        },
      ],
      phrase: [
        {
          phrase: 'draw an analogy',
          meaning: '打一个比方',
        },
      ],
      relWord: [
        {
          pos: 'adj.',
          words: [
            {
              headWord: 'analogous',
              tranCn: '类似的；相似的',
            },
          ],
        },
      ],
    },
    {
      wordRank: 3,
      wordHead: 'anonymous',
      ukphone: 'əˈnɒnɪməs',
      usphone: 'əˈnɑːnɪməs',
      trans: [
        {
          pos: 'adj.',
          tranCn: '匿名的；无名的',
        },
      ],
      sentences: [
        {
          sContent: 'The donation was made by an anonymous benefactor.',
          sCn: '匿名捐赠者提供了这笔捐款。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'nameless; unidentified',
          hwds: ['nameless', 'unidentified', 'incognito'],
        },
      ],
      phrase: [
        {
          phrase: 'anonymous letter',
          meaning: '匿名信',
        },
      ],
      relWord: [
        {
          pos: 'adv.',
          words: [
            {
              headWord: 'anonymously',
              tranCn: '匿名地',
            },
          ],
        },
      ],
    },
    {
      wordRank: 4,
      wordHead: 'apprehend',
      ukphone: 'ˌæprɪˈhend',
      usphone: 'ˌæprɪˈhend',
      trans: [
        {
          pos: 'v.',
          tranCn: '逮捕；理解；忧虑',
        },
      ],
      sentences: [
        {
          sContent: 'The police apprehended the suspect last night.',
          sCn: '警方昨晚逮捕了嫌疑人。',
        },
      ],
      syno: [
        {
          pos: 'verb',
          tran: 'arrest; grasp',
          hwds: ['arrest', 'capture', 'understand'],
        },
      ],
      phrase: [
        {
          phrase: 'apprehend danger',
          meaning: '忧虑危险',
        },
      ],
      relWord: [
        {
          pos: 'n.',
          words: [
            {
              headWord: 'apprehension',
              tranCn: '忧虑；拘捕',
            },
          ],
        },
      ],
    },
    {
      wordRank: 5,
      wordHead: 'artificial',
      ukphone: 'ˌɑːtɪˈfɪʃ(ə)l',
      usphone: 'ˌɑːrtɪˈfɪʃl',
      trans: [
        {
          pos: 'adj.',
          tranCn: '人工的；虚假的',
        },
      ],
      sentences: [
        {
          sContent: 'Artificial intelligence is reshaping many industries.',
          sCn: '人工智能正在重塑许多行业。',
        },
      ],
      syno: [
        {
          pos: 'adj.',
          tran: 'synthetic; man-made',
          hwds: ['synthetic', 'fake', 'man-made'],
        },
      ],
      phrase: [
        {
          phrase: 'artificial intelligence',
          meaning: '人工智能',
        },
      ],
      relWord: [
        {
          pos: 'adv.',
          words: [
            {
              headWord: 'artificially',
              tranCn: '人工地；人为地',
            },
          ],
        },
      ],
    },
  ],
};

export const mockUser: MockUser = {
  email: 'learner@example.com',
  displayName: 'Jessie',
  avatarUrl:
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80',
  learnedBooks: 3,
  learnedWords: 186,
  progress: [
    {
      bookId: 'cet4',
      lastIndex: 12,
      learnedWords: 95,
      updatedAt: '2024-09-12T10:20:00Z',
    },
    {
      bookId: 'ielts',
      lastIndex: 7,
      learnedWords: 57,
      updatedAt: '2024-09-24T07:10:00Z',
    },
    {
      bookId: 'business',
      lastIndex: 4,
      learnedWords: 34,
      updatedAt: '2024-09-20T11:45:00Z',
    },
  ],
};

export const mockRecentBookIds = mockUser.progress
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .map((item) => item.bookId);
