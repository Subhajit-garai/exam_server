// event types

import {
  diffcultlevel,
  eventRuns,
  eventType,
  ExamStatus,
  ExamType,
  UserRole,
} from "@prisma/client";


// default event type

export type default_conditions_type = {
  when?: string;
};

// START message type
export type sendMessage_data = {
  to: string; // user id or user telegram id
  message: string;
};
export type Table_name = string;
export type AppConfig_FeatureIs = {
  on: Table_name;
  feature: string;
  [key: string]: string;
};
export type UserAttemptToPuschase_conditions = {
  when: AppConfig_FeatureIs; // user id or user telegram id
};

export type message_conditions = UserAttemptToPuschase_conditions;

export type Message_Send_Type = {
  id?: string;
  type: "SEND_MESSAGE"; //eventType;
  description: string;
  data: sendMessage_data;
  conditions: message_conditions; //  UserAttemptToPuschase_conditions;
  created_by: UserRole;
  runs: eventRuns;
  run_at: string; // Exact time to run (if applicable) if "any" means it ran any time
};

// END message type

// START create exam event
export type Create_Exam_data_type = {
  time: string[]; // [02:00 pm , 05:00 pm , 06:00 pm ]
  count: number; //3,
  name: string[] | string; // "autoincrement" --> for detect last exam name  exam@number here number +1
  examname: string; // JECA
  category: string;
  jointime?: string; //"00:15 m"
  duration?: string; //"00:15 m"
  status?: ExamStatus;
  exam_pattern: string;
  time_limit: string; // "t+2" // t t+1 t+2  --> 3 day exam create 12/2 -> 3 , 13/2 ->3 , 14/2 ->3
  difficulty: diffcultlevel;
  examtype: ExamType;
};
export type Create_DPP_data_type = {
  time: string[]; // [02:00 pm , 05:00 pm , 06:00 pm ]
  count: number; //3,
  name: string[] | string; // "autoincrement" --> for detect last exam name  exam@number here number +1
  examname: string; // JECA
  category: string;
  jointime?: string; //"00:15 m"
  duration?: string; //"00:15 m"
  status?: ExamStatus;
  exam_pattern: string[];
  time_limit: string; // "t+2" // t t+1 t+2  --> 3 day exam create 12/2 -> 3 , 13/2 ->3 , 14/2 ->3
  difficulty: diffcultlevel;
  examtype: ExamType;
};
export type Create_Exam_conditions_type = {
  when: string;
};

export type Create_Exam_type = {
  id?: string;
  type: "CREATE_EXAM";
  description: string;
  data: Create_Exam_data_type;
  conditions: Create_Exam_conditions_type; // id none then none condition
  created_by: UserRole;
  runs: eventRuns;
  run_at: string; //02:00 pm  // Exact time to run (if applicable) if "any" means it ran any time
};
export type Create_Dpp_type = {
  id?: string;
  type: "CREATE_DPP";
  description: string;
  data: Create_DPP_data_type;
  conditions: Create_Exam_conditions_type; // id none then none condition
  created_by: UserRole;
  runs: eventRuns;
  run_at: string; //02:00 pm  // Exact time to run (if applicable) if "any" means it ran any time
};

// END create exam event

export type Create_Telegram_Quiz_data_type = {
  type: "quiz" | "rapidquiz";
  bot_user_id: string; // bot id
  bot_provided_user_id: number;
  bot_provided_chat_id: number;
};
export type Create_Telegram_Quiz_type = {
  id?: string;
  type: "RUN_NEW_QUIZ";
  description: string;
  data: Create_Telegram_Quiz_data_type;
  conditions: default_conditions_type; // id none then none condition
  created_by: UserRole;
  runs: eventRuns;
  run_at: string; //02:00 pm  // Exact time to run (if applicable) if "any" means it ran any time
};

export type events =
  | Message_Send_Type
  | Create_Exam_type
  | Create_Dpp_type
  | Create_Telegram_Quiz_type;
