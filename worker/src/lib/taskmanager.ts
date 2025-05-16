import axios from "axios";
import { ExamAnsProcessor } from "./ExamAnsProcessor";
import {
  ExamQuestionProcessor,
  SelectQuestion_type,
} from "./ExamQuestionProcessor";
import { RedisProvider } from "./radisProvider";
import {
  ansType,
  Right_Wrong,
  Right_Wrong_set_type,
  Task,
} from "./types/types";
import { log } from "console";

export class taskmanager {
  private static instance: taskmanager;
  private questionprocessor: ExamQuestionProcessor;
  private ansprocessor: ExamAnsProcessor;
  private redisclient: RedisProvider;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new taskmanager();
    }
    return this.instance;
  }

  private constructor() {
    this.questionprocessor = ExamQuestionProcessor.getInstance(5);
    this.ansprocessor = ExamAnsProcessor.getInstance();
    this.redisclient = RedisProvider.getInstance();
  }

  getredisClient() {
    return this.redisclient;
  }
  
  async handleExam(data: Task) {
    try {
      let ans_array: string[] = [];

      if (data.type === "CreateExam") {
        let { examid } = data;
        let examptternId = await this.questionprocessor.getExamPatternId(
          examid
        );
        let exampattern = await this.questionprocessor.getExamPattern(
          examptternId
        );
        let { topics, total_questions, is_multiple_ans } = exampattern;

        let finalquestions: any = {};
        let promises = total_questions.map(
          async (question: number, index: number) => {
            // console.log("questions count " , question);

            let data = await this.questionprocessor.selectQuestions(
              question,
              topics,
              is_multiple_ans[index]
            );

            let Question_array: string[] = [];

            Object.keys(data as SelectQuestion_type).map((d) => {
              data &&
                data[d].map((ele) => {
                  Question_array.push(ele);
                });
            });

            let res = await this.questionprocessor.getQuestionsAns(
              Question_array
            );

            res.map((r: any) => {
              r.part = `part${index + 1}`;
            });
            ans_array.push(res);
            return (finalquestions[`part${index + 1}`] = Question_array);
          }
        );

        await Promise.all(promises);

        // send question to db
        let responce = await this.questionprocessor.AddQuestionsAndAnsIntoExam(
          examid,
          finalquestions,
          ans_array
        );
        // add ansset
        if (responce) {
          console.log("exam Question added");

          this.getredisClient().push({
            type: "Notify",
            status: true,
            data: { examid: examid },
            message: "exam created",
          });
          console.log("added notification");
        } else {
          console.log(" notification not updated");
        }
      }
    } catch (error) {
      console.log("error in task manager handleExam ", error);
    }
  }

  async handleScore(data: Task) {
    try {
      if (data.type === "CreateScore") {
        // get exam's ans or question id for serching /getting user

        let { examid, userid } = data;

        let examAns = await this.ansprocessor.getAnsKeys(examid);
        let userAns = await this.ansprocessor.getUserAns(examid, userid);

        // return

        // calculate leaderBoard
        // console.log("--------------------------------------------------------");
        // console.log("userAns all ", userAns);

        // exam pattern needed
        let exam_pattern = await this.ansprocessor.getExamPatternFormStore(
          examid
        );

        let SCORE = 0;
        let UNATTEMPT = 0;

        let WRONG = 0;
        let RIGHT = 0;
        let RIGHT_WRONG: Right_Wrong_set_type = {};
        let topic_wise_R_W: Right_Wrong_set_type = {}; // it calculate how much wrong in topic wise , and it build weakness metrix

        function validateOption(ans: string[], userAns: string[]) {
          // console.log("ans" ,ans ,"user ans option" ,userAns);
          // calculate part score
          return userAns.every((item) => ans.includes(item)) ? 1 : 0;
        }

        let { is_multiple_ans } = exam_pattern;

        const filteredExamAns: Record<string, ansType[]> = {};

        examAns.forEach((q: any) => {
          if (!filteredExamAns[q.part]) {
            filteredExamAns[q.part] = [];
          }
          filteredExamAns[q.part].push(q);
        });

        // console.log("filteredExamAns " ,filteredExamAns);
        // console.log("userAns " ,userAns);

        Object.keys(filteredExamAns).map((part, i: number) => {
          filteredExamAns[part].map((ans: any) => {
            let id = ans.id;
            let topic = ans.topic;
            let PART = ans.part;
            if (!RIGHT_WRONG[PART]) {
              RIGHT_WRONG[PART] = { Right: 0, Wrong: 0 }; // Initialize if not exists
            }
            if (!topic_wise_R_W[topic]) {
              topic_wise_R_W[topic] = { Right: 0, Wrong: 0 }; // Initialize if not exists
            }

            if (userAns[id]) {
              let { ans: user_ans, part } = userAns[id];

              if (PART == part) {
                // multiple ans checking
                if (is_multiple_ans[i]) {
                  console.log("multiple ans");
                  // console.log("user ans for " , id , " is " , user_ans , " and part is --> " ,part , "is multiple ans " ,is_multiple_ans[i],"ans is " , ans.ans );
                  let user_ans_array = user_ans.split(",");
                  let result = validateOption(ans.ans, user_ans_array);

                  if (result) {
                    // console.log( "user",user_ans_array , user_ans_array.length ,"ans" ,ans.ans ,ans.ans.length);

                    let buff = user_ans_array.length / ans.ans.length;
                    topic_wise_R_W[topic].Right += 1;
                    RIGHT_WRONG[PART].Right += buff;
                    ++RIGHT;
                  } else {
                    // console.log("1 point minus for ",i+1);
                    // if (user_ans == null) {
                    //   UNATTEMPT += 1;
                    // } else {
                    topic_wise_R_W[topic].Wrong += 1;
                    // RIGHT_WRONG[PART].Wrong += 1;
                    ++WRONG;
                    // }
                  }
                } else {
                  let ANS = ans.ans[0];
                  if (ANS == user_ans) {
                    // console.log("1 point add for ",i+1);
                    topic_wise_R_W[topic].Right += 1;
                    RIGHT_WRONG[PART].Right += 1;
                    ++RIGHT;
                  } else {
                    // console.log("1 point minus for ",i+1);
                    // if (user_ans == null) {
                    //   UNATTEMPT += 1;
                    // } else {
                    topic_wise_R_W[topic].Wrong += 1;
                    RIGHT_WRONG[PART].Wrong += 1;
                    ++WRONG;
                    // }
                  }
                }
              }
            } else {
              console.log("not exists or not ans -----> ");
              UNATTEMPT += 1;
            }
          });

          // console.log("RIGHT_WRONG", RIGHT_WRONG);
          // console.log("RIGHT_WRONG_subject", topic_wise_R_W);
        });

        let { part, marks_values, neg_values, total_questions } = exam_pattern;

        if (part) {
          let num;

          console.log(RIGHT_WRONG);

          Object.keys(RIGHT_WRONG).map((p, i: number) => {
            let part = `part${i + 1}`;
            let neg_marking =
              parseInt(neg_values[i]) < 1
                ? 0
                : RIGHT_WRONG[part].Wrong / parseInt(neg_values[i]);
            num =
              RIGHT_WRONG[part].Right * parseInt(marks_values[i]) - neg_marking; // parseInt(neg_values[i]) < 1 ? 1 :
            SCORE += num < 0 ? 0 : num;

            console.log(
              `${RIGHT_WRONG[part].Right} , right . ${RIGHT_WRONG[part].Wrong} , wrong . ${neg_values[i]} neg`
            );
            console.log(
              ` ${part} part ${num} num ${neg_marking} neg_marking ${SCORE} score , ${WRONG} wrong ,${RIGHT} right`
            );
          });
        } else {
          let num =
            RIGHT_WRONG["part1"].Right * marks_values[0] -
            RIGHT_WRONG["part1"].Wrong /
              (parseInt(neg_values[0]) < 1 ? 1 : parseInt(neg_values[0]));
          SCORE += num < 0 ? 0 : num;
        }

        console.log(`${SCORE} score , ${WRONG} wrong ,${RIGHT} right`);

        // add score in to db
        let all_parts_total_questions: number = total_questions.reduce(
          (sum: number, question: number) => sum + question,
          0
        );

        let status = await this.ansprocessor.setUserScore(
          examid,
          userid,
          SCORE,
          UNATTEMPT,
          RIGHT_WRONG,
          topic_wise_R_W,
          all_parts_total_questions
        );

        if (!status) {
          // add this task in queue again if any error
          let task: Task = {
            type: "CreateScore",
            examid: examid,
            userid: userid,
          };
          // add to queue

          console.log("CreateScore task add into queue");
        } else {
          console.log("score add into db");
        }
      }
    } catch (error) {
      console.log("error in task manager handleScore ", error);
    }
  }

  async handleAns(data: Task) {

    try {
      
    if (data.type === "AnsProcessing") {
      let responce = await this.redisclient.setUserans(data, 14400);
      console.log("handleAns ---> ", responce);
    }
    } catch (error) {
      console.log("error in task manager handleAns ", error);
      
    }
  }

  async handleQuiz(Data: Task) {
    try {
      if (Data.type === "createQuiz") {
        let {
          totalQuetions,
          chatid,
          userid,
          topics,
          cburl,
          nextQuestionTime,
          quizOpenFor,
          ismultiple,
        } = Data;

        let data = await this.questionprocessor.selectQuestions(
          totalQuetions,
          topics,
          ismultiple // is_multiple_ans
        );
        let Question_array: string[] = [];

        Object.keys(data as SelectQuestion_type).map((d) => {
          data &&
            data[d].map((ele) => {
              Question_array.push(ele);
            });
        });

        let finalquestions = await this.questionprocessor.getQuestions(
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
            userid: userid,
            topics: topics,
            totalQuetions: totalQuetions,
            nextQuestionTime: nextQuestionTime,
            quizOpenFor: quizOpenFor,
          },
        };
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
    } catch (error) {
      console.log("error in task manager handleQuiz ", error);
    }
  }
}
