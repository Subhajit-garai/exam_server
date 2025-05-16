import { CreationTypes, PrismaClient } from "@prisma/client";
import { Task } from "./types/types";
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
  prisma: any;
  count: number = 0;
  private static instance: ExamQuestionProcessor;

  private constructor(refreshtime: number) {
    this.Questions = {
      normal: [],
      multipleAns: [],
    };
    // this.totalQusestions = 0;
    // this.subject = [];
    this.refreshtime = refreshtime;
    this.prisma = new PrismaClient();
    // console.log("creating ....");
    this.updateQuestionIds();
    this.refreshQuestionsIdList();
    // this.updateQuestionsIdList();
  }

  public static getInstance(refreshtime: number) {
    if (!this.instance) {
      this.instance = new ExamQuestionProcessor(refreshtime);
    }
    return this.instance;
  }

  // private updateQuestionsIdList() {
  //   setInterval(async () => {
  //     console.log(this.Questions.length);
  //   }, this.refreshtime * 1000);
  // }

  private refreshQuestionsIdList() {
    setInterval(async () => {
      // console.log("Refreshing question list...");
      await this.updateQuestionIds();
    }, this.refreshtime * 1000 * 60 * 60);
  }

  private async updateQuestionIds() {
    try {
      let topicNormalAnsQuestions = await this.prisma
        .$queryRaw`SELECT topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = false AND status = 'Done' GROUP BY topic; `;
      let topicMultiplaAnsQuestions = await this.prisma
        .$queryRaw`SELECT topic, ARRAY_AGG(id) AS ids FROM "Questions"  WHERE is_multiple_ans = true AND status = 'Done' GROUP BY topic; `;

      let NormalAnsQuestions: QuestionsId[] = await topicNormalAnsQuestions;
      let MultiplaAnsQuestions: QuestionsId[] = await topicMultiplaAnsQuestions;

      if (!NormalAnsQuestions) {
        NormalAnsQuestions = [];
      }
      if (!MultiplaAnsQuestions) {
        MultiplaAnsQuestions = [];
      }

      this.Questions.multipleAns = MultiplaAnsQuestions;
      this.Questions.normal = NormalAnsQuestions;

      console.log(" normal " ,  NormalAnsQuestions.length);
      console.log(" multipleAns " , MultiplaAnsQuestions.length);
      
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

      this.count = 0; //debug  how many loop it takes to get the result
      let selectedElements: SelectQuestion_type = {};

      await new Promise<void>((resolve,reject) => {
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
              }else{
                reject(new Error("Questions not found in DB"));
              }
            }
          }
        }, 1000); // Check every 1 second
      });

      // select question id

      if (is_multiple_ans) {
        let Questions = this.Questions.multipleAns; // multiple ans  questions

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

  async getExamPatternId(examid: string) {
    try {
      let data = await this.prisma.exam.findFirst({
        where: {
          id: examid,
        },
        select: {
          exam_pattern_id: true,
        },
      });
      if (data) {
        console.log("exampattern is ", data);
        return data.exam_pattern_id;
      } else {
        // console.log("examid", examid);
        // console.log("data", data);
        // throw new Error("exampattern id not found");
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getExamPattern(id: string) {
    try {
      let data = await this.prisma.exam_pattern.findFirst({
        where: {
          id: id,
        },
      });
      if (data) {
        return data;
      } else {
        throw new Error(" exampattern data not found");
      }
    } catch (error) {
      console.log(error);
    }
  }
  async AddQuestionsAndAnsIntoExam(id: string, questions: {}, ans: string[]) {
    try {
      const result = await this.prisma.$transaction(async (tx: any) => {
        let data = await this.prisma.exam.update({
          where: {
            id: id,
          },
          data: {
            questions: questions,
            created_at: new Date(),
            creationstatus: CreationTypes.Done,
          },
          select: {
            ansid: true,
          },
        });

        let ansID = data.ansid;
        await tx.AnsSheet.update({
          where: {
            id: ansID,
          },
          data: {
            ans: ans,
            examId: id,
          },
        });
      });
      return 1;
    } catch (error) {
      console.log("---------->", error);
    }
  }

  async getQuestions(ids: string[]) {
    try {
      let res = await this.prisma.questions.findMany({
        where: {
          id: { in: ids }, // Match all question IDs
        },
        select: {
          ans: true, // Only retrieve the 'answers' field
          id: true,
          topic: true,
          explanation: true,
          title: true,
          options: true,
        },
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  }
  async getQuestionsAns(ids: string[]) {
    try {
      let res = await this.prisma.questions.findMany({
        where: {
          id: { in: ids }, // Match all question IDs
        },
        select: {
          ans: true, // Only retrieve the 'answers' field
          id: true,
          topic: true,
        },
      });

      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async getExamsAnsSet(examid: string) {
    // get exams ans set
    try {
      let ansset = await this.prisma.ansSheet.findFirst({
        where: {
          examId: examid,
        },
        select: {
          ans: true,
        },
      });

      return ansset.ans.flat();
    } catch (error) {
      console.log("error in examprocesser -> getExamsAnsSet ", error);
    }
  }

  async setUseransTodb(formated_user_Ans: any, examid: string, userid: string) {
    try {
      let isAnsExist = await this.prisma.userAns.findFirst({
        where: {
          examId: examid,
          userId: userid,
        },
      });

      if (isAnsExist) {
        console.log("ans already added for this user .. -> ", userid);
        return true;
      }
      let res = await this.prisma.userAns.create({
        data: {
          ans: formated_user_Ans,
          examId: examid,
          userId: userid,
        },
      });

      if (res) {
        return res;
      }
      // console.log("ans added .....",res);
    } catch (error) {
      console.log("error in setUseransTodb", error);
    }
  }
}
