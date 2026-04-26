// event types

import {
  exam_create_event_data_schema,
  quiz_create_event_data_schema,
} from "@/zod/event.zod.js";
import { eventRuns, UserRole, eventType } from "@repo/db/schema/enums.js";

type JsonValue = string | number | boolean | { [key: string]: JsonValue } | JsonValue[] | null;

import * as z from "zod";

export type Table_name = string;

export type AppConfig_FeatureIs = {
  on: Table_name;
  feature: string;
  [key: string]: string;
};
export type UserAttemptToPuschase_conditions = {
  when: AppConfig_FeatureIs; // user id or user telegram id
};

export type event_exam_data_type = z.infer<
  typeof exam_create_event_data_schema
>;

export type event_Quiz_data_type = z.infer<
  typeof quiz_create_event_data_schema
>;




// export interface events {
//   id: string;
//   type: eventType;
//   description: string;
//   payload: JsonValue; // inpute data  , task type , description
//   conditions: JsonValue; // inpute data  , task type , description
//   isActive: boolean;
//   created_by: UserRole;
//   created_at: Date;
//   runs: eventRuns;
//   run_at: string; //02:00 pm  // Exact time to run (if applicable) if "any" means it ran any time
// }
