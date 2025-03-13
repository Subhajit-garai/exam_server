import { hashPasswordFn } from "../../lib/hash";
import prisma from "../../db";



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



export const requesttoprimestatus  =async (req: any, res: any) => {
   try {
    
     let data = req.body
    //  console.log(data);
    return    res.json({ success: true, message: " status saved successfully" });

   } catch (error) {
     console.log(error);
     
   }
 }

export const addbotToken  =async (req: any, res: any) => {
   try {
     let token = req.body.token;
     
     token = await hashPasswordFn(token);
 
    //  console.log("token" ,token);
     
     let response = await prisma.bottoken.create({
       data: {
         token: [token],
       },
     });
    //  console.log("responce", response);
     
     if (response) {
       res.json({ success: true, message: "bot token set successfully" });
     }
   } catch (error) {
     console.log(error);
     
   }
 }