import { exam_questionmap } from "./pocess/exam_questionmap.process";

const process = async () => {
  console.log("Starting process ...");

  await exam_questionmap();
};

process();
