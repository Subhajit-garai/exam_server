import { BotService } from "@/services/bot/bot.service.js";
import { exam_question_map_format } from "./types/types.js";
import { logger } from "@/utils/logger.js";
import { question_map } from "@repo/prisma/browser.js";
import { question_mapCreateManyArgs } from "@repo/prisma/models.js";
export type SelectQuestionNumber_type = Record<string, number>;
export type SelectQuestion_type = Record<string, string[]>;

export interface QuestionsId {
  subject_name: string;
  ids: string[];
}
// export type QuestionsIDS_type = QuestionsId[];
export type QuestionsIDS_type = {
  normal: QuestionsId[];
  multipleAns: QuestionsId[];
};

export class examQuestionManger {
  Questions: QuestionsIDS_type;
  refreshtime: number;
  count: number = 0;
  private static instance: examQuestionManger;
  private BotService: BotService;

  private constructor(refreshtime: number) {
    this.Questions = {
      normal: [],
      multipleAns: [],
    };
    this.BotService = new BotService();
    this.refreshtime = refreshtime;
    this.updateQuestionIds();
    this.refreshQuestionsIdList();
  }

  public static getInstance(refreshtime?: number) {
    if (!this.instance) {
      this.instance = new examQuestionManger(refreshtime ?? 5);
    }
    return this.instance;
  }

  private refreshQuestionsIdList() {
    setInterval(async () => {
      logger.info("Refreshing question list...");
      await this.updateQuestionIds();
    }, this.refreshtime * 1000 * 60 * 60);
  }

  private async updateQuestionIds() {
    try {
      logger.info("Updating questions ids...");
      let responce = await this.BotService.exam.getQuestionsIds();
      logger.info("request send");
      if (responce) {
        logger.success("Question ids info recived ");
      } else {
        logger.error("Question ids info recived ");
        console.log(responce);
      }

      let { topicNormalAnsQuestions, topicMultiplaAnsQuestions } = responce;

      let NormalAnsQuestions: QuestionsId[] = topicNormalAnsQuestions;
      let MultiplaAnsQuestions: QuestionsId[] = topicMultiplaAnsQuestions;

      if (!NormalAnsQuestions) {
        NormalAnsQuestions = [];
      }
      if (!MultiplaAnsQuestions) {
        MultiplaAnsQuestions = [];
      }

      this.Questions.multipleAns = MultiplaAnsQuestions;
      this.Questions.normal = NormalAnsQuestions;

      console.log(" normal -->", NormalAnsQuestions.length);
      console.log(" multipleAns -->", MultiplaAnsQuestions.length);
    } catch (error) {
      console.log("Error while Fatching Questions");
      console.log(error);
    }
  }

  dreawArandomNumber = (remainingQuestion: number, range: number): number => {
    this.count++;
    if (Number.isNaN(remainingQuestion) || Number.isNaN(range)) return 0;

    let mynumber = Math.floor(Math.random() * range + 1);

    if (remainingQuestion < range / 2) return remainingQuestion;
    if (remainingQuestion > mynumber) return mynumber;

    if (
      (remainingQuestion == range || remainingQuestion < 2) &&
      remainingQuestion > -1
    ) {
      return remainingQuestion;
    }
    return this.dreawArandomNumber(remainingQuestion, range);
  };

  selecteQuestionsNumber = (
    totalQusestions: number,
    subject: string[]
  ): SelectQuestionNumber_type => {
    logger.info("Selecting Questions Number");

    // init
    let takenQuestion: SelectQuestionNumber_type = {};
    let totaltakenQuestion: number = 0;
    let remainingQuestion: number = totalQusestions;
    let totalSubject: number = subject.length;
    let seed =
      totalQusestions > 17
        ? 17
        : this.dreawArandomNumber(4, Math.floor(totalQusestions / 2));

    // end init

    subject.forEach((sub) => {
      takenQuestion[`${sub}`] = 0;
    });

    let avg: number = Math.floor(totalQusestions / totalSubject);

    let mandatory: number =
      avg + this.dreawArandomNumber(seed, Math.floor(avg / 2));
    let number: number = 0;
    let counter = totalSubject;

    while (totaltakenQuestion != totalQusestions) {
      if (avg == remainingQuestion) {
        if (totaltakenQuestion == totalQusestions && remainingQuestion == 0) {
          break;
        }
        subject.forEach((sub) => {
          if (remainingQuestion == 0) return;
          takenQuestion[`${sub}`] = takenQuestion[`${sub}`] + 1;
          totaltakenQuestion = totaltakenQuestion + 1;
          remainingQuestion = remainingQuestion - 1;
        });
      } else {
        subject.forEach((sub) => {
          if (totaltakenQuestion == totalQusestions && remainingQuestion == 0) {
            return;
          }

          if (remainingQuestion > avg) {
            number = this.dreawArandomNumber(remainingQuestion, avg);
            if (
              takenQuestion[`${sub}`] > mandatory ||
              takenQuestion[`${sub}`] + number > mandatory
            )
              return;

            takenQuestion[`${sub}`] = takenQuestion[`${sub}`] + number;
            totaltakenQuestion = totaltakenQuestion + number;
            remainingQuestion = remainingQuestion - number;
          } else {
            if (
              totaltakenQuestion == totalQusestions &&
              remainingQuestion == 0
            ) {
              return;
            }

            let catagory = Math.floor(Math.random() * totalSubject + 1);

            number = this.dreawArandomNumber(remainingQuestion, avg);

            subject.forEach((sub, index) => {
              if (index + 1 == catagory) {
                if (
                  takenQuestion[`${sub}`] > mandatory ||
                  takenQuestion[`${sub}`] + number > mandatory
                ) {
                  if (counter) --counter;
                  if (!counter) {
                    avg = Math.floor(avg / 2 + avg / 4);
                  }
                  return;
                }
                takenQuestion[`${sub}`] = takenQuestion[`${sub}`] + number;
                totaltakenQuestion = totaltakenQuestion + number;
                remainingQuestion = remainingQuestion - number;
              }
            });
          }
        });
      }

      if (remainingQuestion < 0)
        throw new Error("remainingQuestion be greater than zero.");
    }
    return takenQuestion;
  };

  selectQuestions = async (
    totalQusestions: number,
    subject: string[],
    is_multiple_ans: any
  ): Promise<SelectQuestion_type | null> => {
    try {
      logger.info("Selecting Questions");
      subject = subject.map((sub: string) => sub);
      let questionset = this.selecteQuestionsNumber(totalQusestions, subject); //questionset  { OS: 2, DBMS: 2, UNIX: 1 }
      logger.info("questionset -->", questionset)

      this.count = 0; //debug  how many loop it takes to get the result
      let selectedElements: SelectQuestion_type = {};
      let selectedNormal: any[] = [];

      await new Promise<void>((resolve, reject) => {
        let count = 10;
        const interval = setInterval(() => {
          if (
            this.Questions.normal.length > 0 &&
            this.Questions.multipleAns.length > 0
          ) {
            clearInterval(interval); // Stop the interval when the condition is met
            resolve(); // Resolve the promise
          } else {
            count--;
            if (!count) {
              if (
                this.Questions.normal.length > 0 ||
                this.Questions.multipleAns.length > 0
              ) {
                clearInterval(interval); // Stop the interval when the condition is met
                resolve();
              } else {
                reject(new Error("Questions not found in DB"));
              }
            }
          }
        }, 1000); // Check every 1 second
      });

      // select question id

      if (is_multiple_ans) {

        let Questions = this.Questions.multipleAns; // multiple ans  questions
        let singleAns_Questions = this.Questions.normal; // normal ans  questions for varience

        if (Object.keys(questionset).length <= singleAns_Questions.length) {

          if (
            Object.keys(questionset).length <= Questions.length ||
            Object.keys(questionset).length <= singleAns_Questions.length
          ) {
            // here topic changed into old_topic , in new archi tecture we saprate subjcet , topic tables for note

            Object.keys(questionset).map((selectedTopic) => {
              singleAns_Questions.forEach((singleTopic) => {

                if (selectedTopic == singleTopic.subject_name) {

                  let multiple_question_set: QuestionsId = {
                    subject_name: "",
                    ids: []
                  }

                  Questions.forEach((topic) => {
                    if (topic.subject_name == selectedTopic) {
                      multiple_question_set = topic
                    }
                  })


                  let normalShuffled = [...singleTopic.ids].sort(
                    () => Math.random() - 0.5
                  ); // Shuffle elements
                  normalShuffled = [...normalShuffled].sort(
                    () => Math.random() - 0.5
                  ); // Shuffle elements


                  let select_normal_question_number: number = 5;

                  while (
                    select_normal_question_number + multiple_question_set.ids.length <
                    questionset[multiple_question_set.subject_name]
                  ) {
                    select_normal_question_number += 5;
                  }

                  selectedNormal = [
                    ...normalShuffled.slice(
                      0,
                      select_normal_question_number
                    ),
                  ];

                  let shuffled = [...multiple_question_set.ids].sort(() => Math.random() - 0.5); // Shuffle elements
                  shuffled = [...shuffled, ...selectedNormal].sort(
                    () => Math.random() - 0.5
                  ); // merge ans shuffle normal and multiple

                  selectedElements[selectedTopic] = [
                    ...shuffled.slice(0, questionset[selectedTopic]),
                  ];



                }
              });
            });
          }


        } else {
          throw new Error(
            "Given some Subject isn't Supported  in multiple_ans question selection"
          );
        }
      } else {

        let Questions = this.Questions.normal; // normal ans  questions

        if (Object.keys(questionset).length <= Questions.length) {

          Questions.forEach((topic) => {

            Object.keys(questionset).map((selectedTopic) => {
              if (topic.subject_name == selectedTopic) {
                let shuffled = [...topic.ids].sort(() => Math.random() - 0.5); // Shuffle elements
                shuffled = [...shuffled].sort(() => Math.random() - 0.5); // Shuffle elements
                shuffled = [...shuffled].sort(() => Math.random() - 0.5); // Shuffle elements

                selectedElements[selectedTopic] = [
                  ...shuffled.slice(0, questionset[selectedTopic]),
                ];
              }
            });
          });
        } else {
          throw new Error(
            "Given some Subject isn't Supported  in question selection"
          );
        }
      }
      return selectedElements;


    } catch (error) {
      console.log("Error in selecteQuestionsNumber fn", error);
      return null;
    }
  };

  async AddQuestionsIntoExam(examid: string, questions: SelectQuestion_type) {
    const data: exam_question_map_format[] = [];

    Object.keys(questions).forEach((part) => {
      questions[part].forEach((questionid: string, idx: number) => {
        data.push({
          number: idx + 1,
          questionid: questionid,
          part: part,
          examid: examid,
        });
      });
    });


    let res = await this.BotService.exam.addQuestionsToExam(data);
    return res ? res : false;
  }



}
