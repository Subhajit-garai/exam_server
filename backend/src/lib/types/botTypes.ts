/**
 * webhook:{
 * baseUrl:"http://localhost:2000/",
 * endpoint:{
 * reciveQuizData: "/reciveQuizdata",
 * startQuiz: "/startQuiz",
 * }}
 */

export type webhook_entry_type = "endpoint" | "baseurl"

export type  webhook_type ={
    baseurl: string,
    endpoint: {
        survertask: string,
        startQuiz: string,
    }
}

