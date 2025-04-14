
import prisma from "../../db";
import { examManager } from "../../lib/examManager";

const em = examManager.getInstance();


export const test = async (req: any, res: any) => {
  try {
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in quiz test --->", error);
  }
};







// export const createQuiz = async (req: any, res: any) => {
//   try {
//     let telegram_id  = req.query.telegram_id;

//     let user = await prisma.user.findFirst({
//       where: { 
//         telegram:{
//             telegramid: telegram_id
//         }
//       },
//       select:{
//         id: true
//       }
//     });

//     if(!user) return res.status(400).json({ success: false, message: "user not found" });
//     console.log("debug user_id ----> ", user.id);
//     // more info like topic and  question counts
//     let Notifystatus = await em.getredisclient().push({
//         type: "CreateQuiz",
//         userid: user.id,
//       });
//       // call back to user
//       if (Notifystatus) {
//         console.log("Notifystatus", Notifystatus);
//         console.log("exam Created ....");
//       }
    
//     res.json({ success: true, message: "message", data: "data" });
//   } catch (error) {
//     console.log("Error in quiz test --->", error);
//   }
// };




export const getquestionsset = async (req: any, res: any) => {
  try {
    let quizid = req.query.quizid;
    if(!quizid) return res.status(400).json({ success: false, message: "quizid is required" });

    let questionsSet = await prisma.quiz.findFirst({
        where: { id: quizid },
        select:{
            questions: true
        }
    });

    if(!questionsSet) return res.status(400).json({ success: false, message: "quiz not found" });




    console.log("debug questionSet ----> " , questionsSet);
    
    res.json({ success: true, message: "message", questions: questionsSet });
  } catch (error) {
    console.log("Error in quiz  getquestionsset --->", error);
  }
};
