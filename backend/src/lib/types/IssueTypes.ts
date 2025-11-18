export type Issue_type_type = "";

export type IssueDetails_type = {
  id: string;
  title?: string;
  topic?: string;
  option?: string[];
  ans?: string[];
};

export type Question_Issue = {
  type: Issue_type_type;
  note:string;
  IssueDetails:IssueDetails_type
};
export type Issue = Question_Issue;
