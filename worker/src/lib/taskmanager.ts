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
    this.redisclient =  RedisProvider.getInstance();
  }

  getredisClient() {
    return this.redisclient;
  }
  async handleExam(data: Task) {
    let ans_array: string[] = [];

    if (data.type === "CreateExam") {
      let { examid } = data;
      let examptternId = await this.questionprocessor.getExamPatternId(examid);
      let exampattern = await this.questionprocessor.getExamPattern(examptternId);
      let { topics, total_questions } = exampattern;
      
      let finalquestions: any = {};
      let promises = total_questions.map(
        async (question: number, index: number) => {

          // console.log("questions count " , question);
          
          let data = await this.questionprocessor.selectQuestions(question, topics);
          
          let Question_array: string[] = [];

          Object.keys(data as SelectQuestion_type).map((d) => {
            data &&
              data[d].map((ele) => {
                Question_array.push(ele);
              });
          });

          let res = await this.questionprocessor.getQuestionsAns(Question_array);

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
  }

  async handleScore(data: Task) {
    if (data.type === "CreateScore") {
      // get exam's ans or question id for serching /getting user

      let { examid, userid } = data;

      let examAns = await this.ansprocessor.getAnsKeys(examid);

      let userAns = await this.ansprocessor.getUserAns(examid, userid);
      
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

      function validateOption(ans: string[], option: string[]) {  // calculate part score 
        return option.every((item) => ans.includes(item)) ? 1 : 0;
      }

      examAns.map((ans: any, i: number) => {
        let id = ans.id;
        let topic = ans.topic;
        let PART = ans.part;

        // console.log("the topic is for the question --->",topic);

        if (!RIGHT_WRONG[PART]) {
          RIGHT_WRONG[PART] = { Right: 0, Wrong: 0 }; // Initialize if not exists
        }
        if (!topic_wise_R_W[topic]) {
          topic_wise_R_W[topic] = { Right: 0, Wrong: 0 }; // Initialize if not exists
        }
        
        if (userAns[id]) {
          let { ans: user_ans, part } = userAns[id];
          
          if (PART == part) {
            // if(userans )
            if (ans.ans[0].length > 1) {  // ans.ans[0].length this to a valid variable which indicate this question have multiple ans  in testing ---------------------------------------------------------->
              console.log("multiple ans correct");
              // hendle multiple ans
              let result = validateOption(ans.ans[0],user_ans)
              // let buff =  ( user_ans.length  /ans.ans[0].length)


              let buff =  1 // remove this

              if(result){
                topic_wise_R_W[topic].Right += 1;
                RIGHT_WRONG[PART].Right += buff;
                ++RIGHT;
              } else {
                // console.log("1 point minus for ",i+1);
                if (user_ans == null) {
                  UNATTEMPT += 1;
                } else {
                  topic_wise_R_W[topic].Wrong += 1;
                  // RIGHT_WRONG[PART].Wrong += 1;
                  ++WRONG;
                }
              }

            }

            let ANS = ans.ans[0];
            if (ANS == user_ans) {
              // console.log("1 point add for ",i+1);
              topic_wise_R_W[topic].Right += 1;
              RIGHT_WRONG[PART].Right += 1;
              ++RIGHT;
            } else {
              // console.log("1 point minus for ",i+1);
              if (user_ans == null) {
                UNATTEMPT += 1;
              } else {
                topic_wise_R_W[topic].Wrong += 1;
                RIGHT_WRONG[PART].Wrong += 1;
                ++WRONG;
              }
            }
          }
        } else {
          console.log("not exists -----> ");
        }
      });

      
      let {
        part,
        marks_values,
        neg_values,
        total_questions
      } = exam_pattern;
        console.log("topicWise Result ---> ", part , marks_values , neg_values);
        console.log("RIGHT_WRONG", RIGHT_WRONG);
        
      if (part) {
        let num;
        Object.keys(RIGHT_WRONG).map((part: string, i: number) => {
          num =
            RIGHT_WRONG[part].Right * parseInt(marks_values[i]) -
            RIGHT_WRONG[part].Wrong /
              (parseInt(neg_values[i]) < 1 ? 1 : parseInt(neg_values[i]));
          SCORE += num < 0 ? 0 : num;
        });
      } else {
        SCORE =
          RIGHT_WRONG["part1"].Right * marks_values[0] -
          RIGHT_WRONG["part1"].Wrong /
            (parseInt(neg_values[0]) < 1 ? 1 : parseInt(neg_values[0]));
      }

      
      console.log(`${SCORE} score , ${WRONG} wrong ,${RIGHT} right`);

      // add score in to db
      let all_parts_total_questions:number = total_questions.reduce((sum: number, question: number) => sum + question, 0);
      
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
        // add this task in queue again
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
  }

  async handleAns(data: Task) {
    if (data.type === "AnsProcessing") {
      let responce = await this.redisclient.setUserans(data ,14400);
      console.log("handleAns ---> ", responce);
    }
  }
}
