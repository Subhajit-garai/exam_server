import { pgEnum } from "drizzle-orm/pg-core"


export const ActivityType = pgEnum('ActivityType', ['DAILY_CHALLENGE', 'QUIZ', 'TEST', 'DPP', 'MOCK', 'CHAPTER', 'STREAK_BONUS', 'OTHER'])

export const BadgeRule = pgEnum('BadgeRule', ['ACTIVITY_COUNT', 'STREAK_COUNT', 'XP_THRESHOLD', 'TOPIC_MASTERY'])

export const Platform = pgEnum('Platform', ['NONE', 'WEBAPP', 'ANDROIDAPP', 'TELEGRAM', 'WHATSAPP'])

export const SocialPlatform = pgEnum('SocialPlatform', ['email', 'telegram', 'whatsApp', 'linkedIn', 'gitHub', 'twitter', 'instagram', 'facebook', 'website'])

export const eventType = pgEnum('eventType', ['RUN_NEW_QUIZ', 'CREATE_QUIZ_CONTEST', 'SEND_MESSAGE', 'CREATE_DPP', 'CREATE_EXAM', 'CLEAR_BOT_CACHE', 'ACTIVITY_LEADERBOARD_ARCHIVE'])

export const eventRuns = pgEnum('eventRuns', ['ONE', 'DAILY', 'WEEKLY', 'MONTHLY'])

export const access_type = pgEnum('access_type', ['Free', 'Paid'])

export const ExamScope = pgEnum('ExamScope', ['NATIONAL', 'STATE', 'COLLEGE', 'OTHER'])

export const ExamStatus = pgEnum('ExamStatus', ['REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'EVALUATION_IN_PROGRESS', 'RESULT_PUBLISHED', 'ARCHIVED'])

export const ExamType = pgEnum('ExamType', ['Test', 'Contest', 'Mock', 'PYQ', 'Subject', 'Dpp', 'Quiz'])

export const EventStatus = pgEnum('EventStatus', ['completed', 'current', 'upcoming'])

export const IssueType = pgEnum('IssueType', ['QUESTION', 'UI', 'EXAM', 'PAYMENT', 'LOGIN', 'SIGNUP'])

export const OfferPlan = pgEnum('OfferPlan', ['BASIC', 'STANDARD', 'PREMIUM', 'PLATINUM'])

export const purchaseType = pgEnum('purchaseType', ['SUBSCRIPTION', 'TOKEN'])

export const ProgressStatus = pgEnum('ProgressStatus', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'])

export const ProcessingStatus = pgEnum('ProcessingStatus', ['Pending', 'Approved', 'Rejected'])

export const quiz_type = pgEnum('quiz_type', ['telegram_quiz', 'quiz'])

export const TopicStatus = pgEnum('TopicStatus', ['draft', 'published', 'archived'])

export const ExamStage = pgEnum('ExamStage', ['Registration', 'Started', 'Ended'])

export const diffcultlevel = pgEnum('diffcultlevel', ['Easy', 'Medium', 'Hard'])

export const check = pgEnum('check', ['Normal', 'Hybrid'])

export const Status = pgEnum('Status', ['Created', 'Processing', 'Done', 'Duplicate', 'Suspended', 'Close'])

export const CreationTypes = pgEnum('CreationTypes', ['Updated', 'Created', 'Processing', 'Done', 'Suspended'])

export const Visibility = pgEnum('Visibility', ['Public', 'Private'])

export const syllabusType = pgEnum('syllabusType', ['Generic', 'Syllabus'])

export const examformat = pgEnum('examformat', ['Text', 'Image', 'Code'])

export const SyllabusType = pgEnum('SyllabusType', ['EXAM', 'QUIZ', 'TEST'])

export const telegramgroupType = pgEnum('telegramgroupType', ['group', 'private', 'channel', 'supergroup'])

export const ban_status = pgEnum('ban_status', ['Ban', 'UnBan', 'Block'])

export const primeStatus = pgEnum('primeStatus', ['None', 'Bronze', 'Silver', 'Gold'])

export const UserRole = pgEnum('UserRole', ['Admin', 'User', 'Tutor', 'Bot'])

export type ActivityType = typeof ActivityType.enumValues[number];
export type BadgeRule = typeof BadgeRule.enumValues[number];
export type Platform = typeof Platform.enumValues[number];
export type SocialPlatform = typeof SocialPlatform.enumValues[number];
export type eventType = typeof eventType.enumValues[number];
export type eventRuns = typeof eventRuns.enumValues[number];
export type access_type = typeof access_type.enumValues[number];
export type ExamScope = typeof ExamScope.enumValues[number];
export type ExamStatus = typeof ExamStatus.enumValues[number];
export type ExamType = typeof ExamType.enumValues[number];
export type EventStatus = typeof EventStatus.enumValues[number];
export type IssueType = typeof IssueType.enumValues[number];
export type OfferPlan = typeof OfferPlan.enumValues[number];
export type purchaseType = typeof purchaseType.enumValues[number];
export type ProgressStatus = typeof ProgressStatus.enumValues[number];
export type ProcessingStatus = typeof ProcessingStatus.enumValues[number];
export type quiz_type = typeof quiz_type.enumValues[number];
export type TopicStatus = typeof TopicStatus.enumValues[number];
export type ExamStage = typeof ExamStage.enumValues[number];
export type diffcultlevel = typeof diffcultlevel.enumValues[number];
export type check = typeof check.enumValues[number];
export type Status = typeof Status.enumValues[number];
export type CreationTypes = typeof CreationTypes.enumValues[number];
export type Visibility = typeof Visibility.enumValues[number];
export type syllabusType = typeof syllabusType.enumValues[number];
export type examformat = typeof examformat.enumValues[number];
export type SyllabusType = typeof SyllabusType.enumValues[number];
export type telegramgroupType = typeof telegramgroupType.enumValues[number];
export type ban_status = typeof ban_status.enumValues[number];
export type primeStatus = typeof primeStatus.enumValues[number];
export type UserRole = typeof UserRole.enumValues[number];

