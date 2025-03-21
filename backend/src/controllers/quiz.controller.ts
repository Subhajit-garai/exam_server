
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


export const createQuiz = async (req: any, res: any) => {
  try {
    let telegram_id  = req.query.telegram_id;

    let user = await prisma.user.findFirst({
      where: { 
        telegram:{
            telegramid: telegram_id
        }
      },
      select:{
        id: true
      }
    });

    if(!user) return res.status(400).json({ success: false, message: "user not found" });
    console.log("debug user_id ----> ", user.id);
    // more info like topic and  question counts
    let Notifystatus = await em.getredisclient().push({
        type: "CreateQuiz",
        userid: user.id,
      });
      // call back to user
      if (Notifystatus) {
        console.log("Notifystatus", Notifystatus);
        console.log("exam Created ....");
      }
    
    res.json({ success: true, message: "message", data: "data" });
  } catch (error) {
    console.log("Error in quiz test --->", error);
  }
};

export const sendQuizTopic  =async (req: any, res: any) => {
    try {
     
     let quiztype = req.query.quiztype
     let response = await prisma.botQuizTopic.findFirst({})
     let data:{} | null =null
     if (quiztype == "quiz") {
       data ={
         data:response?.quiztopic || null
       }
     }
     else{
       data ={
         data:response?.rapidtopic || null,
         question_count:response?.question_count ||null
       }     
     }    
     return  res.json({ success: true, message: " topic sended successfully" ,data:data});
 
    } catch (error) {
      console.log(error);
      
    }
}
export const setrQuizTopic  =async (req: any, res: any) => {
    try {
     
      let data = req.body
      let response = await prisma.botQuizTopic.create({
       data:{
         quiztopic:data.quiztopic,
         rapidtopic:data.rapidtopic,
         exam:data.exam,
         question_count:data.question_count
 
       }
      })
 
      if(!response){
       return    res.json({ success: false, message: " topic not set!, error occure",data:response});
 
      }     
     return    res.json({ success: true, message: " topic set successfully"});
 
    } catch (error) {
      console.log(error);
      
    }
}

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
