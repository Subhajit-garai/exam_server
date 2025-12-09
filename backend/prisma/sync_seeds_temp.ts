
import { PrismaClient } from "./generated/prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

console.log('Script starting...');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

console.log('Prisma client initialized');

async function main() {

    console.log('Starting sync of seed data...');

    try {
        // 1. Export Category, Subject, Topic
        const Users = await prisma.user.findMany();
        const Targetexam = await prisma.targetExam.findMany();
        const examYear = await prisma.examYear.findMany();
        const syllabus = await prisma.syllabus.findMany();
        const categories = await prisma.category.findMany();
        const subjects = await prisma.subject.findMany();
        const topics = await prisma.topic.findMany();
        const events = await prisma.events.findMany();
        const social = await prisma.social.findMany();

        // New Important Tables
        const questions = await prisma.questions.findMany();
        const examPatterns = await prisma.exam_pattern.findMany();
        const tiers = await prisma.tier.findMany();
        const tierBenefits = await prisma.tierBenefit.findMany();
        const appConfigs = await prisma.appConfig.findMany();
        const subjectSyllabusMap = await prisma.subjectSyllabusMap.findMany();
        const topicsSubjectMap = await prisma.topicsSubjectMap.findMany();

        // Additional Tables (Backup All)
        const primes = await prisma.prime.findMany();
        const examProgress = await prisma.examProgress.findMany();
        const dppProgress = await prisma.dppProgress.findMany();
        const quizProgress = await prisma.quizProgress.findMany();
        const blance = await prisma.blance.findMany();
        const userAns = await prisma.userAns.findMany();
        const notifications = await prisma.notification.findMany();
        const comments = await prisma.comment.findMany();
        const entryChargeLists = await prisma.entryChargeList.findMany();
        const contestRegisters = await prisma.contestRegister.findMany();
        const quizzes = await prisma.quiz.findMany();
        const quizQuestionMaps = await prisma.quiz_question_map.findMany();
        const quizRegisters = await prisma.quizRegister.findMany();
        const questionProcessings = await prisma.questionProcessing.findMany();
        const orders = await prisma.order.findMany();
        const payments = await prisma.payment.findMany();
        const subcriptionOffers = await prisma.subcriptionOffers.findMany();
        const topicNoteVersions = await prisma.topicNoteVersion.findMany();
        const issues = await prisma.issue.findMany();
        const examTimelines = await prisma.examTimeline.findMany();
        const coupons = await prisma.coupon.findMany();
        const couponUsages = await prisma.couponUsage.findMany();
        const botQuizConfigs = await prisma.botQuizConfig.findMany();
        const botInfos = await prisma.botInfo.findMany();
        const dailyChallenges = await prisma.dailyChallenge.findMany();
        const userActivities = await prisma.userActivity.findMany();
        const userStreaks = await prisma.userStreak.findMany();
        const badges = await prisma.badge.findMany();
        const userBadges = await prisma.userBadge.findMany();
        const activityLeaderboards = await prisma.activityLeaderboard.findMany();
        const telegramGroupInfos = await prisma.telegramGroupInfo.findMany();
        const telegramGroupTopics = await prisma.telegramGroupTopic.findMany();
        const telegramBanUsers = await prisma.telegram_ban_user.findMany();
        const timescaleScores = await prisma.timescale_score.findMany();
        const scores = await prisma.score.findMany();
        const leaderboards = await prisma.leaderboard.findMany();

        // Filtered Exams (Mock and PYQ)
        const exams = await prisma.exam.findMany({
            where: {
                examtype: {
                    in: ['Mock', 'PYQ'] // Enums based on schema: Mock, PYQ
                }
            }
        });

        // Question Maps for the filtered exams
        const examIds = exams.map(e => e.id);
        const questionMaps = await prisma.question_map.findMany({
            where: {
                examid: {
                    in: examIds
                }
            }
        });

        // Adjusted path: we are in prisma/ folder, so seeds/data is ../seeds/data
        const dataDir = path.join(__dirname, '..', '..', '..', 'seeds', 'data');

        if (!fs.existsSync(dataDir)) {
            console.log(`Directory not found: ${dataDir}, creating it.`);
            fs.mkdirSync(dataDir, { recursive: true });
        }


        // Writing new files
        fs.writeFileSync(path.join(dataDir, 'question.json'), JSON.stringify(questions, null, 2));
        console.log(`Exported ${questions.length} questions to question.json`);

        fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(events, null, 2));
        fs.writeFileSync(path.join(dataDir, 'events.json'), JSON.stringify(events, null, 2));
        console.log(`Exported ${events.length} events to events.json`);

        fs.writeFileSync(path.join(dataDir, 'social.json'), JSON.stringify(social, null, 2));
        console.log(`Exported ${social.length} social records to social.json`);

        fs.writeFileSync(path.join(dataDir, 'user.json'), JSON.stringify(Users, null, 2));
        console.log(`Exported ${Targetexam.length} user to user.json`);

        fs.writeFileSync(path.join(dataDir, 'targetExam.json'), JSON.stringify(Targetexam, null, 2));
        console.log(`Exported ${Targetexam.length} targetExam to targetExam.json`);

        fs.writeFileSync(path.join(dataDir, 'examYear.json'), JSON.stringify(examYear, null, 2));
        console.log(`Exported ${examYear.length} examYear to examYear.json`);

        fs.writeFileSync(path.join(dataDir, 'syllabus.json'), JSON.stringify(syllabus, null, 2));
        console.log(`Exported ${syllabus.length} syllabus to syllabus.json`);

        fs.writeFileSync(path.join(dataDir, 'category.json'), JSON.stringify(categories, null, 2));
        console.log(`Exported ${categories.length} categories to category.json`);

        fs.writeFileSync(path.join(dataDir, 'subject.json'), JSON.stringify(subjects, null, 2));
        console.log(`Exported ${subjects.length} subjects to subject.json`);

        fs.writeFileSync(path.join(dataDir, 'topic.json'), JSON.stringify(topics, null, 2));
        console.log(`Exported ${topics.length} topics to topic.json`);



        fs.writeFileSync(path.join(dataDir, 'exam_pattern.json'), JSON.stringify(examPatterns, null, 2));
        console.log(`Exported ${examPatterns.length} examPatterns to exam_pattern.json`);

        fs.writeFileSync(path.join(dataDir, 'tier.json'), JSON.stringify(tiers, null, 2));
        console.log(`Exported ${tiers.length} tiers to tier.json`);

        fs.writeFileSync(path.join(dataDir, 'tierBenefit.json'), JSON.stringify(tierBenefits, null, 2));
        console.log(`Exported ${tierBenefits.length} tierBenefits to tierBenefit.json`);

        fs.writeFileSync(path.join(dataDir, 'appConfig.json'), JSON.stringify(appConfigs, null, 2));
        console.log(`Exported ${appConfigs.length} appConfigs to appConfig.json`);

        fs.writeFileSync(path.join(dataDir, 'subjectSyllabusMap.json'), JSON.stringify(subjectSyllabusMap, null, 2));
        console.log(`Exported ${subjectSyllabusMap.length} subjectSyllabusMap to subjectSyllabusMap.json`);

        fs.writeFileSync(path.join(dataDir, 'topicsSubjectMap.json'), JSON.stringify(topicsSubjectMap, null, 2));
        console.log(`Exported ${topicsSubjectMap.length} topicsSubjectMap to topicsSubjectMap.json`);

        fs.writeFileSync(path.join(dataDir, 'exam.json'), JSON.stringify(exams, null, 2));
        console.log(`Exported ${exams.length} exams (Mock/PYQ) to exam.json`);

        fs.writeFileSync(path.join(dataDir, 'question_map.json'), JSON.stringify(questionMaps, null, 2));
        console.log(`Exported ${questionMaps.length} questionMaps to question_map.json`);

        fs.writeFileSync(path.join(dataDir, 'prime.json'), JSON.stringify(primes, null, 2));
        fs.writeFileSync(path.join(dataDir, 'examProgress.json'), JSON.stringify(examProgress, null, 2));
        fs.writeFileSync(path.join(dataDir, 'dppProgress.json'), JSON.stringify(dppProgress, null, 2));
        fs.writeFileSync(path.join(dataDir, 'quizProgress.json'), JSON.stringify(quizProgress, null, 2));
        fs.writeFileSync(path.join(dataDir, 'blance.json'), JSON.stringify(blance, null, 2));
        fs.writeFileSync(path.join(dataDir, 'userAns.json'), JSON.stringify(userAns, null, 2));
        fs.writeFileSync(path.join(dataDir, 'notification.json'), JSON.stringify(notifications, null, 2));
        fs.writeFileSync(path.join(dataDir, 'comment.json'), JSON.stringify(comments, null, 2));
        fs.writeFileSync(path.join(dataDir, 'entryChargeList.json'), JSON.stringify(entryChargeLists, null, 2));
        fs.writeFileSync(path.join(dataDir, 'contestRegister.json'), JSON.stringify(contestRegisters, null, 2));
        fs.writeFileSync(path.join(dataDir, 'quiz.json'), JSON.stringify(quizzes, null, 2));
        fs.writeFileSync(path.join(dataDir, 'quiz_question_map.json'), JSON.stringify(quizQuestionMaps, null, 2));
        fs.writeFileSync(path.join(dataDir, 'quizRegister.json'), JSON.stringify(quizRegisters, null, 2));
        fs.writeFileSync(path.join(dataDir, 'questionProcessing.json'), JSON.stringify(questionProcessings, null, 2));
        fs.writeFileSync(path.join(dataDir, 'order.json'), JSON.stringify(orders, null, 2));
        fs.writeFileSync(path.join(dataDir, 'payment.json'), JSON.stringify(payments, null, 2));
        fs.writeFileSync(path.join(dataDir, 'subcriptionOffers.json'), JSON.stringify(subcriptionOffers, null, 2));
        fs.writeFileSync(path.join(dataDir, 'topicNoteVersion.json'), JSON.stringify(topicNoteVersions, null, 2));
        fs.writeFileSync(path.join(dataDir, 'issue.json'), JSON.stringify(issues, null, 2));
        fs.writeFileSync(path.join(dataDir, 'examTimeline.json'), JSON.stringify(examTimelines, null, 2));
        fs.writeFileSync(path.join(dataDir, 'coupon.json'), JSON.stringify(coupons, null, 2));
        fs.writeFileSync(path.join(dataDir, 'couponUsage.json'), JSON.stringify(couponUsages, null, 2));
        fs.writeFileSync(path.join(dataDir, 'botQuizConfig.json'), JSON.stringify(botQuizConfigs, null, 2));
        fs.writeFileSync(path.join(dataDir, 'botInfo.json'), JSON.stringify(botInfos, null, 2));
        fs.writeFileSync(path.join(dataDir, 'dailyChallenge.json'), JSON.stringify(dailyChallenges, null, 2));
        fs.writeFileSync(path.join(dataDir, 'userActivity.json'), JSON.stringify(userActivities, null, 2));
        fs.writeFileSync(path.join(dataDir, 'userStreak.json'), JSON.stringify(userStreaks, null, 2));
        fs.writeFileSync(path.join(dataDir, 'badge.json'), JSON.stringify(badges, null, 2));
        fs.writeFileSync(path.join(dataDir, 'userBadge.json'), JSON.stringify(userBadges, null, 2));
        fs.writeFileSync(path.join(dataDir, 'activityLeaderboard.json'), JSON.stringify(activityLeaderboards, null, 2));
        fs.writeFileSync(path.join(dataDir, 'telegramGroupInfo.json'), JSON.stringify(telegramGroupInfos, null, 2));
        fs.writeFileSync(path.join(dataDir, 'telegramGroupTopic.json'), JSON.stringify(telegramGroupTopics, null, 2));
        fs.writeFileSync(path.join(dataDir, 'telegram_ban_user.json'), JSON.stringify(telegramBanUsers, null, 2));
        fs.writeFileSync(path.join(dataDir, 'timescale_score.json'), JSON.stringify(timescaleScores, null, 2));
        fs.writeFileSync(path.join(dataDir, 'score.json'), JSON.stringify(scores, null, 2));
        fs.writeFileSync(path.join(dataDir, 'leaderboard.json'), JSON.stringify(leaderboards, null, 2));


    } catch (error) {
        console.error('Error syncing seed data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
