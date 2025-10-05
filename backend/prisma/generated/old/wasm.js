
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.4.1
 * Query Engine version: a9055b89e58b4b5bfb59600785423b1db3d0e75d
 */
Prisma.prismaVersion = {
  client: "6.4.1",
  engine: "a9055b89e58b4b5bfb59600785423b1db3d0e75d"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  contactno: 'contactno',
  password: 'password',
  telegramid: 'telegramid',
  verificationid: 'verificationid',
  progressid: 'progressid',
  role: 'role',
  join_at: 'join_at',
  forgotpasswordToken: 'forgotpasswordToken',
  resetTokenExpires: 'resetTokenExpires',
  accesstoken: 'accesstoken'
};

exports.Prisma.TelegramGroupInfoScalarFieldEnum = {
  id: 'id',
  groupid: 'groupid',
  groupname: 'groupname',
  groupType: 'groupType',
  grouplink: 'grouplink',
  isTopic: 'isTopic',
  isPremium: 'isPremium',
  adminIds: 'adminIds',
  isBanned: 'isBanned',
  lastActiveAt: 'lastActiveAt',
  messageCount: 'messageCount',
  quizCount: 'quizCount',
  language: 'language',
  timezone: 'timezone',
  features: 'features',
  groupstatus: 'groupstatus',
  created_at: 'created_at'
};

exports.Prisma.TelegramGroupTopicScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  name: 'name',
  topicId: 'topicId'
};

exports.Prisma.Telegram_ban_userScalarFieldEnum = {
  id: 'id',
  bot_id: 'bot_id',
  user_telegram_id: 'user_telegram_id',
  ban_from_type: 'ban_from_type',
  ban_from_id: 'ban_from_id',
  status: 'status',
  at: 'at'
};

exports.Prisma.BotQuizConfigScalarFieldEnum = {
  id: 'id',
  quiztopic: 'quiztopic',
  rapidtopic: 'rapidtopic',
  exam: 'exam',
  nextQuestionTime: 'nextQuestionTime',
  quizOpenFor: 'quizOpenFor',
  question_count: 'question_count',
  created_by: 'created_by',
  created_at: 'created_at'
};

exports.Prisma.BotInfoScalarFieldEnum = {
  id: 'id',
  botuser_id: 'botuser_id',
  token: 'token',
  webhook: 'webhook'
};

exports.Prisma.CoponScalarFieldEnum = {
  id: 'id',
  token: 'token',
  count: 'count',
  cupon: 'cupon',
  accessby: 'accessby',
  created_by: 'created_by',
  created_at: 'created_at'
};

exports.Prisma.Timescale_scoreScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  exam_id: 'exam_id',
  score: 'score',
  not_attempt: 'not_attempt',
  topic_wise_result: 'topic_wise_result',
  result: 'result',
  time: 'time'
};

exports.Prisma.LeaderboardScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  exam_id: 'exam_id',
  rank: 'rank',
  score: 'score',
  time: 'time'
};

exports.Prisma.ScoreScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  exam_id: 'exam_id',
  leaderboard_id: 'leaderboard_id',
  not_attempt: 'not_attempt',
  score: 'score',
  total_questions: 'total_questions',
  topic_wise_result: 'topic_wise_result',
  result: 'result',
  time: 'time'
};

exports.Prisma.AppConfigScalarFieldEnum = {
  id: 'id',
  feature: 'feature',
  settings: 'settings',
  updated_at: 'updated_at'
};

exports.Prisma.IssueScalarFieldEnum = {
  id: 'id',
  type: 'type',
  note: 'note',
  IssueDetails: 'IssueDetails',
  status: 'status',
  upVote: 'upVote',
  downVote: 'downVote',
  priorityVote: 'priorityVote',
  created_at: 'created_at',
  creator_role: 'creator_role',
  created_by: 'created_by'
};

exports.Prisma.EventsScalarFieldEnum = {
  id: 'id',
  type: 'type',
  description: 'description',
  data: 'data',
  conditions: 'conditions',
  created_by: 'created_by',
  created_at: 'created_at',
  runs: 'runs',
  run_at: 'run_at'
};

exports.Prisma.EntryChargeListScalarFieldEnum = {
  id: 'id',
  type: 'type',
  Charge: 'Charge',
  created_at: 'created_at',
  created_by: 'created_by'
};

exports.Prisma.TierScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TierBenefitScalarFieldEnum = {
  id: 'id',
  tierId: 'tierId',
  feature: 'feature',
  access: 'access',
  limit: 'limit',
  used: 'used',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubcriptionOffersScalarFieldEnum = {
  id: 'id',
  markedPrice: 'markedPrice',
  discount: 'discount',
  type: 'type',
  title: 'title',
  price: 'price',
  token: 'token',
  time: 'time',
  offerActive: 'offerActive',
  offerInActive: 'offerInActive',
  btncolor: 'btncolor',
  created_by: 'created_by',
  created_at: 'created_at'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  order_id: 'order_id',
  type: 'type',
  amount: 'amount',
  token: 'token',
  subcription: 'subcription',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  razorpay_order_id: 'razorpay_order_id',
  razorpay_payment_id: 'razorpay_payment_id',
  razorpay_signature: 'razorpay_signature',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.PrimeScalarFieldEnum = {
  id: 'id',
  status: 'status',
  userid: 'userid',
  expiry: 'expiry'
};

exports.Prisma.VerificationScalarFieldEnum = {
  id: 'id',
  contactno: 'contactno',
  email: 'email',
  telegram: 'telegram',
  whatsapp: 'whatsapp'
};

exports.Prisma.ProgressScalarFieldEnum = {
  id: 'id',
  attempted: 'attempted',
  attendedContest: 'attendedContest',
  attendedQuiz: 'attendedQuiz',
  attendedExam: 'attendedExam',
  attendedMock: 'attendedMock',
  attendedPYQ: 'attendedPYQ',
  userid: 'userid',
  rank: 'rank',
  inTopten: 'inTopten',
  accuracy: 'accuracy',
  topinexam: 'topinexam',
  topinContest: 'topinContest',
  openRegister: 'openRegister',
  lastExamid: 'lastExamid',
  lastDppid: 'lastDppid',
  lastMockid: 'lastMockid',
  lastContestid: 'lastContestid',
  lastQuizid: 'lastQuizid',
  lastExamRank: 'lastExamRank',
  lastDppRank: 'lastDppRank',
  lastMockRank: 'lastMockRank',
  lastContestRank: 'lastContestRank',
  lastQuizRank: 'lastQuizRank',
  time: 'time'
};

exports.Prisma.BlanceScalarFieldEnum = {
  id: 'id',
  userid: 'userid',
  amount: 'amount',
  ticket: 'ticket',
  last_update: 'last_update'
};

exports.Prisma.TelegramScalarFieldEnum = {
  id: 'id',
  userid: 'userid',
  telegramid: 'telegramid',
  last_update: 'last_update'
};

exports.Prisma.QuestionsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  options: 'options',
  extra: 'extra',
  ans: 'ans',
  formate: 'formate',
  category: 'category',
  sub_topic: 'sub_topic',
  history: 'history',
  topic: 'topic',
  explanation: 'explanation',
  links: 'links',
  is_multiple_ans: 'is_multiple_ans',
  difficulty: 'difficulty',
  created_by: 'created_by',
  created_at: 'created_at',
  status: 'status',
  weight: 'weight'
};

exports.Prisma.SyllabusScalarFieldEnum = {
  id: 'id',
  category: 'category',
  examname: 'examname',
  topics: 'topics',
  created_at: 'created_at'
};

exports.Prisma.Exam_patternScalarFieldEnum = {
  id: 'id',
  title: 'title',
  format: 'format',
  examname: 'examname',
  category: 'category',
  syllabus: 'syllabus',
  topics: 'topics',
  difficulty: 'difficulty',
  part: 'part',
  checkbox: 'checkbox',
  part_Count: 'part_Count',
  total_questions: 'total_questions',
  check: 'check',
  marks_values: 'marks_values',
  neg_values: 'neg_values',
  is_multiple_ans: 'is_multiple_ans',
  created_by: 'created_by'
};

exports.Prisma.Mock_questions_setScalarFieldEnum = {
  id: 'id',
  name: 'name',
  exam: 'exam',
  category: 'category',
  description: 'description',
  questions: 'questions',
  pattern: 'pattern',
  question_difficulty_weight: 'question_difficulty_weight',
  question_topic_count: 'question_topic_count',
  question_part_count: 'question_part_count',
  total_questions: 'total_questions',
  selected_questions_count: 'selected_questions_count',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ExamScalarFieldEnum = {
  id: 'id',
  display_id: 'display_id',
  name: 'name',
  examname: 'examname',
  category: 'category',
  questions: 'questions',
  examtype: 'examtype',
  mockSetId: 'mockSetId',
  created_at: 'created_at',
  created_by: 'created_by',
  exam_pattern_id: 'exam_pattern_id',
  ansid: 'ansid',
  status: 'status',
  creationstatus: 'creationstatus',
  starttime: 'starttime',
  jointime: 'jointime',
  duration: 'duration',
  date: 'date',
  isMultipleAttemp: 'isMultipleAttemp',
  isLive: 'isLive',
  stage: 'stage',
  register_id: 'register_id'
};

exports.Prisma.ContestRegisterScalarFieldEnum = {
  id: 'id',
  examId: 'examId',
  count: 'count',
  users: 'users'
};

exports.Prisma.AnsSheetScalarFieldEnum = {
  id: 'id',
  ans: 'ans',
  examId: 'examId',
  status: 'status'
};

exports.Prisma.QuizScalarFieldEnum = {
  id: 'id',
  display_id: 'display_id',
  quizRegister_id: 'quizRegister_id',
  name: 'name',
  examname: 'examname',
  category: 'category',
  questions: 'questions',
  topics: 'topics',
  total_questions: 'total_questions',
  created_at: 'created_at',
  created_by: 'created_by',
  examtype: 'examtype',
  ansid: 'ansid',
  status: 'status',
  creationstatus: 'creationstatus',
  starttime: 'starttime',
  duration: 'duration',
  date: 'date',
  stage: 'stage'
};

exports.Prisma.QuizRegisterScalarFieldEnum = {
  id: 'id',
  quiz_id: 'quiz_id',
  count: 'count',
  users: 'users'
};

exports.Prisma.UserAnsScalarFieldEnum = {
  id: 'id',
  ans: 'ans',
  examId: 'examId',
  userId: 'userId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  Admin: 'Admin',
  User: 'User',
  Bot: 'Bot'
};

exports.groupType = exports.$Enums.groupType = {
  group: 'group',
  private: 'private',
  channel: 'channel',
  supergroup: 'supergroup'
};

exports.ban_status = exports.$Enums.ban_status = {
  Ban: 'Ban',
  UnBan: 'UnBan',
  Block: 'Block'
};

exports.IssueType = exports.$Enums.IssueType = {
  QUESTION: 'QUESTION',
  UI: 'UI',
  EXAM: 'EXAM',
  PAYMENT: 'PAYMENT',
  LOGIN: 'LOGIN',
  SIGNUP: 'SIGNUP'
};

exports.Status = exports.$Enums.Status = {
  Created: 'Created',
  Processing: 'Processing',
  Done: 'Done',
  Duplicate: 'Duplicate',
  Suspended: 'Suspended',
  Close: 'Close'
};

exports.eventType = exports.$Enums.eventType = {
  RUN_NEW_QUIZ: 'RUN_NEW_QUIZ',
  CREATE_QUIZ_CONTEST: 'CREATE_QUIZ_CONTEST',
  SEND_MESSAGE: 'SEND_MESSAGE',
  CREATE_DPP: 'CREATE_DPP',
  CREATE_EXAM: 'CREATE_EXAM',
  CLEAR_BOT_CACHE: 'CLEAR_BOT_CACHE'
};

exports.eventRuns = exports.$Enums.eventRuns = {
  ONE: 'ONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY'
};

exports.primeStatus = exports.$Enums.primeStatus = {
  None: 'None',
  Bronze: 'Bronze',
  Silver: 'Silver',
  Gold: 'Gold'
};

exports.ExamType = exports.$Enums.ExamType = {
  Exam: 'Exam',
  Contest: 'Contest',
  Mock: 'Mock',
  PYQ: 'PYQ',
  Subject: 'Subject',
  Dpp: 'Dpp',
  Quiz: 'Quiz'
};

exports.purchaseType = exports.$Enums.purchaseType = {
  subcription: 'subcription',
  token: 'token'
};

exports.examformate = exports.$Enums.examformate = {
  Text: 'Text',
  Image: 'Image',
  Code: 'Code'
};

exports.diffcultlevel = exports.$Enums.diffcultlevel = {
  Easy: 'Easy',
  Medium: 'Medium',
  Hard: 'Hard'
};

exports.syllabusType = exports.$Enums.syllabusType = {
  Generic: 'Generic',
  Syllabus: 'Syllabus'
};

exports.check = exports.$Enums.check = {
  Normal: 'Normal',
  Hybrid: 'Hybrid'
};

exports.CreationTypes = exports.$Enums.CreationTypes = {
  Updated: 'Updated',
  Created: 'Created',
  Processing: 'Processing',
  Done: 'Done',
  Suspended: 'Suspended'
};

exports.ExamStatus = exports.$Enums.ExamStatus = {
  Public: 'Public',
  Private: 'Private'
};

exports.ExamStage = exports.$Enums.ExamStage = {
  Registration: 'Registration',
  Started: 'Started',
  Ended: 'Ended'
};

exports.Prisma.ModelName = {
  User: 'User',
  telegramGroupInfo: 'telegramGroupInfo',
  telegramGroupTopic: 'telegramGroupTopic',
  telegram_ban_user: 'telegram_ban_user',
  botQuizConfig: 'botQuizConfig',
  botInfo: 'botInfo',
  copon: 'copon',
  timescale_score: 'timescale_score',
  leaderboard: 'leaderboard',
  score: 'score',
  AppConfig: 'AppConfig',
  Issue: 'Issue',
  events: 'events',
  EntryChargeList: 'EntryChargeList',
  Tier: 'Tier',
  TierBenefit: 'TierBenefit',
  subcriptionOffers: 'subcriptionOffers',
  Order: 'Order',
  payment: 'payment',
  prime: 'prime',
  verification: 'verification',
  progress: 'progress',
  blance: 'blance',
  telegram: 'telegram',
  Questions: 'Questions',
  Syllabus: 'Syllabus',
  Exam_pattern: 'Exam_pattern',
  mock_questions_set: 'mock_questions_set',
  Exam: 'Exam',
  ContestRegister: 'ContestRegister',
  AnsSheet: 'AnsSheet',
  quiz: 'quiz',
  quizRegister: 'quizRegister',
  UserAns: 'UserAns'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
