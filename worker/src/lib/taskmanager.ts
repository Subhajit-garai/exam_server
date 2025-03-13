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
  private examprocessor: ExamQuestionProcessor;
  private ansprocessor: ExamAnsProcessor;
  private redisclient: RedisProvider;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new taskmanager();
    }
    return this.instance;
  }

  private constructor() {
    this.examprocessor = ExamQuestionProcessor.getInstance(5);
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
      let examptternId = await this.examprocessor.getExamPatternId(examid);
      let exampattern = await this.examprocessor.getExamPattern(examptternId);
      let { topics, total_questions } = exampattern;
      
      let finalquestions: any = {};
      let promises = total_questions.map(
        async (question: number, index: number) => {
          let data = await this.examprocessor.selectQuestions(question, topics);
          
          let Question_array: string[] = [];

          Object.keys(data as SelectQuestion_type).map((d) => {
            data &&
              data[d].map((ele) => {
                Question_array.push(ele);
              });
          });

          let res = await this.examprocessor.getQuestionsAns(Question_array);

          res.map((r: any) => {
            r.part = `part${index + 1}`;
          });
          ans_array.push(res);
          return (finalquestions[`part${index + 1}`] = Question_array);
        }
      );

      await Promise.all(promises);

      // send question to db
      let responce = await this.examprocessor.AddQuestionsAndAnsIntoExam(
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

      let userAns = await this.ansprocessor.getUserAns(examid, userid);
      // calculate leaderBoard
      let examAns = await this.ansprocessor.getAnsKeys(examid);
      // console.log("examAns ", examAns);

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
        if (userAns[i][id]) {
          let { ans: user_ans, part } = userAns[i][id];
          if (PART == part) {
            // if(userans )
            if (ans.ans[0].length > 1) {  // ans.ans[0].length this to a valid variable which indicate this question have multiple ans  in testing ---------------------------------------------------------->
              console.log("multiple ans correct");
              // hendle multiple ans
              let result = validateOption(ans.ans[0],user_ans)
              let buff =  ( user_ans.length /ans.ans[0].length)

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

      // ref of calculated score structure
      //       7.5 score , 2 wrong ,8 right
      // topicWise Result --->  {
      //   OS: { Right: 2, Wrong: 1 },
      //   DBMS: { Right: 2, Wrong: 1 },
      //   C: { Right: 1, Wrong: 0 },
      //   UNIX: { Right: 3, Wrong: 0 }
      // }
      //  Result --->  { part1: { Right: 8, Wrong: 2 } }

      // other example

      //       -21.25 score , 97 wrong ,3 right
      // topicWise Result --->  {
      //   OS: { Right: 3, Wrong: 21 },
      //   DBMS: { Right: 0, Wrong: 24 },
      //   C: { Right: 0, Wrong: 34 },
      //   UNIX: { Right: 0, Wrong: 18 }
      // }
      //  Result --->  { part1: { Right: 3, Wrong: 77 }, part2: { Right: 0, Wrong: 20 } }

      // calculate metrix
      // single part
      // RIGHT --> number of Right in exam
      // WRONG --> number of WRONG in exam

      // console.log("topicWise Result ---> ", topic_wise_R_W);
      // console.log(" Result ---> ", RIGHT_WRONG);
      // console.log(" exam_patten ---> ", exam_pattern);
      
      let {
        part,
        marks_values,
        neg_values,
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
          console.log("SCORE", SCORE);
        });
      } else {
        SCORE =
          RIGHT_WRONG["part1"].Right * marks_values[0] -
          RIGHT_WRONG["part1"].Wrong /
            (parseInt(neg_values[0]) < 1 ? 1 : parseInt(neg_values[0]));
      }

      // exam_patten --->  {
      //   id: 'cm6v3pon5000om2fo7u3v99zm',
      //   title: 'newPattern@123',
      //   format: 'Text',
      //   examname: 'JECA',
      //   category: 'CS',
      //   syllabus: 'Syllabus',
      //   topics: [ 'OS', 'DBMS', 'C', 'UNIX' ],
      //   difficulty: 'Medium',
      //   part: false,
      //   checkbox: null,
      //   part_Count: 1,
      //   total_questions: [ 10 ],
      //   check: 'Normal',
      //   marks_values: [ 1 ],
      //   neg_values: [ 4 ],
      //   created_by: 'cm6v3as0x000cm2foo6hw877n'
      // }

      // exam_patten --->  {
      //   id: 'cm6x7szde0001129z3k0kxxo8',
      //   title: 'PartPattenTest',
      //   format: 'Text',
      //   examname: 'JECA',
      //   category: 'CS',
      //   syllabus: 'Syllabus',
      //   topics: [ 'OS', 'DBMS', 'C', 'UNIX' ],
      //   difficulty: 'Medium',
      //   part: true,
      //   checkbox: null,
      //   part_Count: 2,
      //   total_questions: [ 80, 20 ],
      //   check: 'Hybrid',
      //   marks_values: [ 1, 2 ],
      //   neg_values: [ 4, 0 ],
      //   created_by: 'cm6v3as0x000cm2foo6hw877n'
      // }

      console.log(`${SCORE} score , ${WRONG} wrong ,${RIGHT} right`);

      // add score in to db

      let status = await this.ansprocessor.setUserScore(
        examid,
        userid,
        SCORE,
        UNATTEMPT,
        RIGHT_WRONG,
        topic_wise_R_W
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
      let responce = await this.redisclient.set(data ,14400);
      console.log("handleAns ---> ", responce);
    }
  }
}
