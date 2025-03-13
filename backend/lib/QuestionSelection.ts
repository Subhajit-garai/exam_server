export type SelectQuestionNumber_type = Record<string, number>;
export type SelectQuestion_type = Record<string, string[]>;

export const dreawArandomNumber = (
  remainingQuestion: number,
  range: number
): number => {
  let mynumber = Math.floor(Math.random() * range + 1);
  if (remainingQuestion < range / 2) return remainingQuestion;
  if (remainingQuestion > mynumber) return mynumber;
  dreawArandomNumber(remainingQuestion, range);

  return 0;
};

export const selecteQuestionsNumber = (
  totalQusestions: number,
  subject: string[]
): SelectQuestionNumber_type => {
  let takenQuestion: SelectQuestionNumber_type = {};
  let totaltakenQuestion: number = 0;
  let remainingQuestion: number = totalQusestions;
  let totalSubject: number = subject.length;

  subject.forEach((sub) => {
    takenQuestion[`${sub}`] = 0;
  });

  let avg: number = Math.floor(totalQusestions / totalSubject);
  let mandatory: number = avg + dreawArandomNumber(17, Math.floor(avg / 2));
  let number: number = 0;

  while (totaltakenQuestion != totalQusestions) {
    if (avg == remainingQuestion) {
      subject.forEach((sub) => {
        takenQuestion[`${sub}`] = takenQuestion[`${sub}`] + 1;
      });
      totaltakenQuestion = totaltakenQuestion + totalSubject;
      remainingQuestion = remainingQuestion - totalSubject;
      if (totaltakenQuestion == totalQusestions && remainingQuestion == 0) {
        break;
      }
    } else {
      if (totaltakenQuestion == totalQusestions && remainingQuestion == 0) {
        break;
      }

      subject.forEach((sub) => {
        if (totaltakenQuestion == totalQusestions && remainingQuestion == 0) {
          return;
        }

        if (remainingQuestion > avg) {
          number = dreawArandomNumber(remainingQuestion, avg);
          if (
            takenQuestion[`${sub}`] > mandatory ||
            takenQuestion[`${sub}`] + number > mandatory
          )
            return;

          takenQuestion[`${sub}`] = takenQuestion[`${sub}`] + number;
          totaltakenQuestion = totaltakenQuestion + number;
          remainingQuestion = remainingQuestion - number;
        } else {
          if (totaltakenQuestion == totalQusestions && remainingQuestion == 0) {
            return;
          }

          let catagory = Math.floor(Math.random() * totalSubject + 1);

          number = dreawArandomNumber(remainingQuestion, avg);
          subject.forEach((sub, index) => {
            if (index + 1 == catagory) {
              if (
                takenQuestion[`${sub}`] > mandatory ||
                takenQuestion[`${sub}`] + number > mandatory
              )
                return;

              takenQuestion[`${sub}`] = takenQuestion[`${sub}`] + number;
              totaltakenQuestion = totaltakenQuestion + number;
              remainingQuestion = remainingQuestion - number;
            }
          });
        }
      });
    }
  }
  return takenQuestion;
};

export const selectQuestions = (
  Questions: string[][],
  totalQusestions: number,
  subject: string[]
): SelectQuestion_type => {
  let questionset = selecteQuestionsNumber(totalQusestions, subject);
  let selectedElements: SelectQuestion_type = {};

  if (Object.keys(questionset).length == Questions.length) {
    let questioValueArray = Object.values(questionset);
    let questioKeyArray = Object.keys(questionset);

    Questions.forEach((cat, index) => {
      const shuffled = [...cat].sort(() => Math.random() - 0.5); // Shuffle elements
      selectedElements[`${questioKeyArray[index]}`] = [
        ...shuffled.slice(0, questioValueArray[index]),
      ];
    });
  }
  return selectedElements;
};
