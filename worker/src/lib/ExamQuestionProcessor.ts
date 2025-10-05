import { exam_question_map_format, Task } from "./types/types";
import axios from "axios";
import { Network } from "../utils/network";
export type SelectQuestionNumber_type = Record<string, number>;
export type SelectQuestion_type = Record<string, string[]>;

interface QuestionsId {
  topic: string;
  ids: string[];
}
// export type QuestionsIDS_type = QuestionsId[];
export type QuestionsIDS_type = {
  normal: QuestionsId[];
  multipleAns: QuestionsId[];
};

export class ExamQuestionProcessor {
  Questions: QuestionsIDS_type;
  refreshtime: number;
  count: number = 0;
  private static instance: ExamQuestionProcessor;
  private Network: Network;

  private constructor(refreshtime: number) {
    this.Questions = {
      normal: [],
      multipleAns: [],
    };
    this.Network = Network.getInstance();
    this.refreshtime = refreshtime;
    this.updateQuestionIds();
    this.refreshQuestionsIdList();
  }

  public static getInstance(refreshtime: number) {
    if (!this.instance) {
      this.instance = new ExamQuestionProcessor(refreshtime);
    }
    return this.instance;
  }

  public getNetworkInstance() {
    return  this.Network
  }

  private refreshQuestionsIdList() {
    setInterval(async () => {
      // console.log("Refreshing question list...");
      await this.updateQuestionIds();
    }, this.refreshtime * 1000 * 60 * 60);
  }

  private async updateQuestionIds() {
    try {
      let responce = await this.Network.getQuestionsIds();
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
    let takenQuestion: SelectQuestionNumber_type = {};
    let totaltakenQuestion: number = 0;
    let remainingQuestion: number = totalQusestions;
    let totalSubject: number = subject.length;
    let seed =
      totalQusestions > 17
        ? 17
        : this.dreawArandomNumber(4, Math.floor(totalQusestions / 2));

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
                  // console.log("counter ," , counter);
                  // console.log("skip.....");
                  // console.log("++++++> avg", avg);
                  if (!counter) {
                    // console.log("change avg",avg/2);
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
      // console.log('is_multiple_ans' , is_multiple_ans);  ok  1,0

      subject = subject.map((sub: string) => sub.toUpperCase());
      let questionset = this.selecteQuestionsNumber(totalQusestions, subject); //questionset  { OS: 2, DBMS: 2, UNIX: 1 }

      // console.log("questionset", questionset);
      // console.log("subject", subject);
      // console.log("is_multiple_ans", is_multiple_ans);

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
              console.log("run");
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
            Questions.forEach((topic) => {
              singleAns_Questions.forEach((singleTopic) => {
                if (topic.topic == singleTopic.topic) {
                  Object.keys(questionset).map((selectedTopic) => {
                    if (topic.topic == selectedTopic) {
                      let normalShuffled = [...singleTopic.ids].sort(
                        () => Math.random() - 0.5
                      ); // Shuffle elements
                      normalShuffled = [...normalShuffled].sort(
                        () => Math.random() - 0.5
                      ); // Shuffle elements
                      normalShuffled = [...normalShuffled].sort(
                        () => Math.random() - 0.5
                      ); // Shuffle elements
                      selectedNormal = [...normalShuffled.slice(0, 5)];

                      let shuffled = [...topic.ids].sort(
                        () => Math.random() - 0.5
                      ); // Shuffle elements
                      shuffled = [...shuffled].sort(() => Math.random() - 0.5); // Shuffle elements
                      shuffled = [...shuffled, ...selectedNormal].sort(
                        () => Math.random() - 0.5
                      ); // merge ans shuffle normal and multiple

                      selectedElements[topic.topic] = [
                        ...shuffled.slice(0, questionset[topic.topic]),
                      ];
                    }
                  });
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
              if (topic.topic == selectedTopic) {
                let shuffled = [...topic.ids].sort(() => Math.random() - 0.5); // Shuffle elements
                shuffled = [...shuffled].sort(() => Math.random() - 0.5); // Shuffle elements
                shuffled = [...shuffled].sort(() => Math.random() - 0.5); // Shuffle elements
                selectedElements[topic.topic] = [
                  ...shuffled.slice(0, questionset[topic.topic]),
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


  async AddQuestionsIntoExam(examid: string, questions: any) {
    let formated_questions: exam_question_map_format[] = [];

    Object.keys(questions).map((part) => {
      questions[part].map((questionid: string, idx: number) => {
        let temp: exam_question_map_format = {
          number: idx + 1,
          questionid: questionid,
          part: part,
          options: [],
          ans: [],
          examid: examid,
          isSuffled: false,
        };

        formated_questions.push(temp);
      });
    });

    let res = await this.Network.AddQuestions(examid, formated_questions);

    console.log("res -- > ", res);
    

    return  res ? res : false
  }




}
