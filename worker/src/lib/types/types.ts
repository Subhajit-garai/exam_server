export type Task = {
    type: "CreateExam";
    examid: string;
    userid: string;
  } | {
    type: "CreateScore";
    examid: string;
    userid: string;
  } | {
    type: "Notify";
    // id:string,
    status: boolean;
    data: object;
    message: string;
  }| {
    type: "AnsProcessing";
    examid: string,
    userid: string,
    part: string,
    ans: string[],
    id: string
  }
  


  export type ansType = {
    id:string,
    ans: string[],
    part: string,
  }
  export type anskeyType = {
    id:string,
    part: string,
  }

  export type AnsStoreType ={
    [key:string]:ansType[]
  };
  export type AnsKeysTypes ={
    [key:string]:anskeyType[]
  };


  export type Right_Wrong = {
    Right:number,
    Wrong:number
  }

  export type Right_Wrong_set_type ={
    [key:string]:Right_Wrong
  }
