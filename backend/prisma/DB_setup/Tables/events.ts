import { eventRuns, eventType, ExamStatus, UserRole, Visibility } from "@prisma/client";
import prisma from "../../../db/index";



export const addevent = async (botid:string,exam_pattern_id:string) => {

   // add event for day test setup

  let testEvent = await prisma.events.create({
    data: {
      type: eventType.CREATE_EXAM,
      description: "Create new exam",
      data: {
        time: ["8:00 am"],
        count: 1,
        name: "autoincrement",
        examname: "JECA",
        category: "CS",
        status: Visibility.Public,
        time_limit: "t+2",
        exam_pattern: exam_pattern_id,
        duration: "02:00",
        jointime: "10:00",
        difficulty: "Easy",
        examtype: "Exam",
      },
      conditions: { when: "None" },
      created_by: UserRole.Bot,
      runs: eventRuns.DAILY,
      run_at: "04:00 am",
    },
  });


  
    let quiz_clear_event = await prisma.events.create({
      data: {
        type: "CLEAR_BOT_CACHE",
        description: "Clear bot cache event",
        data: {},
        conditions: {
          when: "any",
        },
        runs: eventRuns.DAILY,
        run_at: "2:00 am",
      },
    });


  let quiz_event = await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      data: {
        type: "rapidquiz",
        bot_user_id: botid,
        chat_type: "group",
        bot_provided_user_id: 7057093987,
        bot_provided_chat_id: -1002365541288,
        thread_id: 3,
      },
      conditions: {
        when: "any",
      },
      runs: eventRuns.DAILY,
      run_at: "10:00 pm",
    },
  });
  let premium_quiz_event1 = await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      data: {
        type: "rapidquiz",
        bot_user_id: botid,
        chat_type: "supergroup",
        bot_provided_user_id: 7057093987,
        bot_provided_chat_id: -1002506753144,
        thread_id: 3,
      },
      conditions: {
        when: "any",
      },
      runs: eventRuns.DAILY,
      run_at: "8:00 am",
    },
  });
  let premium_quiz_event2 = await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      data: {
        type: "rapidquiz",
        bot_user_id: botid,
        chat_type: "supergroup",
        bot_provided_user_id: 7057093987,
        bot_provided_chat_id: -1002506753144,
        thread_id: 3,
      },
      conditions: {
        when: "any",
      },
      runs: eventRuns.DAILY,
      run_at: "9:00 am",
    },
  });
  let premium_quiz_event3 = await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      data: {
        type: "rapidquiz",
        bot_user_id: botid,
        chat_type: "supergroup",
        bot_provided_user_id: 7057093987,
        bot_provided_chat_id: -1002506753144,
        thread_id: 3,
      },
      conditions: {
        when: "any",
      },
      runs: eventRuns.DAILY,
      run_at: "8:00 pm",
    },
  });
  let premium_quiz_event4 = await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      data: {
        type: "rapidquiz",
        bot_user_id: botid,
        chat_type: "supergroup",
        bot_provided_user_id: 7057093987,
        bot_provided_chat_id: -1002506753144,
        thread_id: 3,
      },
      conditions: {
        when: "any",
      },
      runs: eventRuns.DAILY,
      run_at: "9:00 pm",
    },
  });
  let premium_quiz_event5 = await prisma.events.create({
    data: {
      type: "RUN_NEW_QUIZ",
      description: "Quiz Event for normal group",
      data: {
        type: "rapidquiz",
        bot_user_id: botid,
        chat_type: "supergroup",
        bot_provided_user_id: 7057093987,
        bot_provided_chat_id: -1002506753144,
        thread_id: 3,
      },
      conditions: {
        when: "any",
      },
      runs: eventRuns.DAILY,
      run_at: "10:30 pm",
    },
  });
};
