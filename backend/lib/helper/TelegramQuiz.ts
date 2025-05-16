import { webhook_type } from "../types/botTypes";

import prisma from "../../db";
import { examManager } from "../examManager";


const em = examManager.getInstance();



export const QuizeSetupFunction =  async (user:string ,data:any) =>{
  
    let {bot_provided_user_id , bot_provided_chat_id ,type ="quiz"} =data;
  
    let totalQuetions: number = 0;
    let quizTopics: string[] = [];
  
    let bot_user = user;
  
    let quiz_config_data = await prisma.botQuizConfig.findFirst({});
    
    if (!quiz_config_data) {
      // throw new Error("No quiz topic found");
      return console.log("quiz config error" ,quiz_config_data);
    }
  
    if (type) {
      switch (type) {
        case "rapidquiz":
          { console.log("rapidquiz");
            quizTopics = quiz_config_data?.rapidtopic;
            totalQuetions = parseInt(quiz_config_data?.question_count);
          }
          break;
  
        default:
          { console.log("quiz");
          
            quizTopics = quiz_config_data?.quiztopic;
            totalQuetions = 1;
          }
          break;
      }
    }
    console.log("bot user", bot_user);
    
    let bot_webhook = await prisma.botInfo.findFirst({
      where: {
        botuser_id: bot_user,
      },
    });
    if (!bot_webhook) {
      console.log("No bot webhook found");
    }
  
    let webhook: webhook_type = bot_webhook?.webhook as webhook_type;    
    let cbUrl = `${webhook.baseurl}${webhook.endpoint.receiveQuizData}`;
  
    let Notifystatus = await em.getredisclient().push({
      //id :
      type: "createQuiz",
      cburl: cbUrl,
      totalQuetions: totalQuetions,
      topics: quizTopics,
      userid: bot_provided_user_id,
      chatid: bot_provided_chat_id,
      nextQuestionTime: quiz_config_data.nextQuestionTime,
      quizOpenFor: quiz_config_data.quizOpenFor,
    });
  
    return Notifystatus;
  }