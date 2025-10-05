import { restoreUser } from "./restore/user.restore";
import { restoreTelegram } from "./restore/telegram.restore";
import { restorePrime } from "./restore/prime.restore";
import { restoreVerification } from "./restore/verification.restore";
import { restoreProgress } from "./restore/progress.restore";
import { restoreAnsSheet } from "./restore/anssheet.restore";
import { restoreAppConfig } from "./restore/AppConfig.restore";
import { restoreExam } from "./restore/exam.restore";
import { restoreexamReg } from "./restore/exam_register.restore";
import { restoreExam_pattern } from "./restore/Exam_pattern.restore";
import { restoreMock_questions_set } from "./restore/mock_questions_set.restore";
import { restoreblance } from "./restore/blance.restore";
import { restorePayment } from "./restore/payment.restore";
import { restoreOrder } from "./restore/Order.restore";
import { restoreSubcriptionOffers } from "./restore/subcriptionOffers.restore";
import { restoreTierBenefit } from "./restore/tierBenefit.restore";
import { restoreTier } from "./restore/tier.restore";
import { restoreEntryChargeList } from "./restore/EntryChargeList.restore";
import { restoreIssue } from "./restore/Issue.restore";
import { restoreEvents } from "./restore/events.restore";
import { restoreTelegramGroupInfo } from "./restore/telegramGroupInfo.restore";
import { restoreTelegramGroupTopic } from "./restore/telegramGroupTopic.restore";
import { restorebotQuizConfig } from "./restore/botQuizConfig.restore";
import { restoretelegram_ban_user } from "./restore/telegram_ban_user.restore";
import { restorebotInfo } from "./restore/botInfo.restore";
import { restoreCopon } from "./restore/copon.restore";
import { restoreLeaderboard } from "./restore/leaderboard.restore";
import { restoreScore } from "./restore/score.restore";
import { restoreUserAns } from "./restore/UserAns.restore";
import { restoreSyllabus } from "./restore/Syllabus.restore";
import { restoreQuestion} from "./restore/Question.restore";
import { restoreQuestion_and_Mock_question_map } from "./restore/Question_map.restore";

async function restore() {
  console.log("Starting migration ...");

  await restoreTelegram();
  await restoreVerification();
  await restoreUser();
  await restorePrime();
  await restoreProgress();
  await restoreAnsSheet();
  await restoreAppConfig();
  await restoreexamReg();
  await restoreExam_pattern();
  await restoreExam();
  await restoreMock_questions_set();
  await restoreblance();
  await restorePayment();
  await restoreOrder();
  await restoreSubcriptionOffers();
  await restoreTier();
  await restoreTierBenefit();
  await restoreEntryChargeList();
  await restoreIssue();
  await restoreEvents();
  await restoreTelegramGroupInfo();
  await restoreTelegramGroupTopic();
  await restorebotQuizConfig();
  await restoretelegram_ban_user();
  await restorebotInfo();
  await restoreCopon();
  await restoreLeaderboard();
  await restoreUserAns();
  await restoreSyllabus();
  await restoreScore();
  await restoreQuestion();
  await restoreQuestion_and_Mock_question_map();

  // syllabus
  // topic
  // subject 
  // subject topic map 
  

}

restore();
