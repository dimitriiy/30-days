import { mockQuestions } from "../mock";
import { Question } from "../system";

export function getMockQuestions() {
  return new Promise<Question[]>((resolve) => {
    setTimeout(() => {
      resolve(mockQuestions);
    }, 1000);
  });
}
