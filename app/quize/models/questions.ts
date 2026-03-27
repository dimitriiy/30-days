import { action, atom } from "@reatom/core";
import { Question } from "../system";
import { getMockQuestions } from "./questions-api";

export const questionsAtom = atom<Question[]>([], "questions").extend((target) => {
  const isLoading = atom(false, `${target.name}.isLoading`);

  const load = action(async () => {
    isLoading.set(true);
    try {
      const data = await getMockQuestions();
      target.set(data);
    } finally {
      isLoading.set(false);
    }
  }, `${target.name}.load`);

  return { isLoading, load };
});
