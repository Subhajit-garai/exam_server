import { BaseWorkerTask } from "../base-task.js";
import {
  examQuestionManger,
  SelectQuestion_type,
} from "../../lib/ExamQuestionProcessor.js";
import { QueueManager } from "@/lib/queue/queueManager.js";
import { RedisManager } from "@/lib/redis/redisManager.js";
import { exam_question_format_type } from "../../lib/types/ans-prossing-types.js";
import { shuffleArraySeeded } from "@/utils/shuffle.js";
import { logger } from "@/utils/logger.js";
import { CreationTypes } from "@repo/db/schema/enums.js";
import { BotService } from "@/services/bot/bot.service.js";

interface QuizMetaData {
  id: string;
  total_questions: number;
  nextQuestionTime: number;
  quizOpenFor: number;  // it is in hours that indicate quiz present in cache in how many hours
  topic: string | "All";
  subject: string;
  limit: number;
  status: CreationTypes;
  created_by?: string;
  creator_role?: string;
}



type quiz_question_type = {
  id: string,
  title: string,
  options: string[],
  ans: string[],
  explanation: string | null,
  format: string,
  extra: any,
  is_multiple_ans: boolean
}


export class QuizCreateTask extends BaseWorkerTask {

  redisManager = RedisManager.getInstance();

  async execute(): Promise<void> {
    logger.info("Running QuizCreateTask with data:", this.task.payload);

    const botService = new BotService()
    let QuestionManagerClient = examQuestionManger.getInstance();
    let quizData: QuizMetaData | null = await this.getQuizMetaData(this.task.payload.quizId);


    if (!quizData) throw Error("quiz data not found");

    this.changeQuizDataStatus(quizData)
    let { total_questions, topic, subject } = quizData

    let topics = [subject];

    let data = await QuestionManagerClient.selectQuestions(
      total_questions,
      topics,
      0 // is_multiple_ans == false
    );

    if (!data) throw Error("questions not found");

    let Question_array: string[] = [];

    Object.keys(data as SelectQuestion_type).map((d) => {
      data &&
        data[d].map((ele: any) => {
          Question_array.push(ele);
        });
    });

    let finalquestions = await botService.exam.getQuestionsByIds(Question_array)
    if (finalquestions) {
      console.log("finalquestions are collected , ready to send to bot");
    }


    try {
      // also add question ans
      //  await this.redisporvider.getclient().set(`quizquestionans:${quizData.id}:part1:${i}`, "1");
      await this.addQuestionsToRedis(quizData.id, finalquestions);
      this.changeQuizDataStatus(quizData, "Done");
    } catch (error) {
      console.log("error in adding questions to redis", error);
    }





  }


  async changeQuizDataStatus(quizData: QuizMetaData, status: CreationTypes = "Processing") {
    quizData.status = status;
    await this.redisManager.getclient().set(`quiz:data:${quizData.id}`, JSON.stringify(quizData), 'KEEPTTL');
  }


  async getQuizMetaData(quizId: string): Promise<QuizMetaData | null> {
    const data = await this.redisManager.getclient().get(`quiz:data:${quizId}`);
    if (!data) return null;
    return JSON.parse(data);
  }



  async addQuestionsToRedis(examId: string, questions: quiz_question_type[]) {

    const formattedQuestions: exam_question_format_type[] = questions.map((question, number) => {

      if (!question?.options) throw Error("Question does not have options");

      const { shuffled, map } = shuffleArraySeeded(question.options, examId);

      return {
        number: (number + 1),
        part: "part1",
        question: {
          ...question,
          options: shuffled,
          map: map,
          is_multiple_ans: question.is_multiple_ans || false,
        },
      };
    });


    // Pipeline for performance
    const pipeline = this.redisManager.getclient().pipeline();
    formattedQuestions.forEach((question) => {
      pipeline.set(
        `quizquestion:${examId}:${question.part}:${question.number}`,
        JSON.stringify(question),
        "EX", 86400 // Expire in 24h
      );
    });
    await pipeline.exec();

    console.log("Questions added to Redis");
  }

}
