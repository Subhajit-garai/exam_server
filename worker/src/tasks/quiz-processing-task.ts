import { BaseWorkerTask } from "./base-task";
import { Network } from "@/utils/network";
import {
  examQuestionManger,
  SelectQuestion_type,
} from "@/lib/ExamQuestionProcessor";
import axios from "axios";

// src/workers/ans-processing-task.ts
export class QuizProcessingTask extends BaseWorkerTask {
  async execute(): Promise<void> {
    console.log("Running QuizProcessingTask with data:", this.task.payload);

    let newtWorkClient = Network.getInstance();
    let QuestionManagerClient = examQuestionManger.getInstance();

    let { chatid, userid, cburl, platform, chat_type } = this.task.payload;

    let thread_id: number = 0;

    console.log("----> chat_type", chat_type);

    if ((platform = "TELEGRAM")) {
      // here get quiz config data

      switch (chat_type) {
        case "private":
          break;
        case "channel":
          break;
        case "group":
          {
            let groupData = await newtWorkClient.telegramgroupinfo(chatid);
            if (!groupData) {
              throw new Error(
                `No group data found or it may be banned",${chatid}`
              );
            }
          }
          break;
        case "supergroup":
          {
            console.log("supergroup chat");

            let groupData = await newtWorkClient.telegramgroupinfo(chatid);

            if (!groupData) {
              throw new Error(
                `No group data found or it may be banned",${chatid}`
              );
            }

            console.log("is topic ", groupData.isTopic);


            if (groupData.isTopic) {


              let topicData: {
                id: string;
                groupId: string;
                name: string;
                topicId: number;
              } | null = await newtWorkClient.telegramGroupTopicInfo(
                chatid,
                "quiz"
              );

              if (!topicData) {
                throw new Error(
                  `No topic data found or it not added, for group ${chatid}`
                );
              }

              thread_id = topicData?.topicId;
              console.log(
                "therad id is avalible and thread id is --> ",
                thread_id
              );
            }
          }

          break;

        default:
          console.log("message user that some invalid data");

          break;
      }

      let quizConfig = await newtWorkClient.getQuizConfigData(
        chatid,
        platform,
        userid
      );


      let {
        total_questions,
        topics,
        ismultiple,
        nextQuestionTime,
        quizOpenFor,
      } = quizConfig;

      let data = await QuestionManagerClient.selectQuestions(
        total_questions,
        topics,
        ismultiple // is_multiple_ans
      );

      let Question_array: string[] = [];

      Object.keys(data as SelectQuestion_type).map((d) => {
        data &&
          data[d].map((ele: any) => {
            Question_array.push(ele);
          });
      });


      let finalquestions = await newtWorkClient.getQuestions_byIds(
        Question_array
      );
      if (finalquestions) {
        console.log("finalquestions are collected , ready to send to bot");
      }

      // logic for webhook

      let webhook_url = cburl;
      let processed_data = {
        type: "quizquestionset",
        questions: finalquestions,
        config: {
          chatid: chatid,
          thread_id: thread_id,
          userid: userid,
          topics: topics,
          total_questions: total_questions,
          nextQuestionTime: nextQuestionTime,
          quizOpenFor: quizOpenFor,
        },
      };

      // console.log("processData ---> ", processed_data);

      let request = await axios.post(webhook_url, processed_data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "token here ",
        },
      });

      if (request.status === 200) {
        console.log("webhook sent successfully");
      }
    }
  }
}
