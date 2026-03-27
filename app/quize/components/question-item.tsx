"use client";

import { reatomComponent } from "@reatom/react";
import { showCorrectAnswerAtom } from "../models";
import { isBaseQuestion, isQuestionWithText, Question } from "../system";
import { QuestionContent } from "./question-content";
import * as motion from "motion/react-client";

type QuestionItemProps = {
  question: Question;
};

const slideVariants = {
  enter: (direction: 1 | -1) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 1 | -1) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export const QuestionItem = reatomComponent(
  ({ question }: QuestionItemProps) => {
    const showCorrectAnswer = showCorrectAnswerAtom();

    return (
      <motion.div
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.7, ease: "easeInOut" }} // Customize transition timing and easing
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <h1
          className={`${isQuestionWithText(question) && "py-10"} shrink-0 text-center text-xl font-bold leading-snug text-white sm:text-5xl`}
        >
          {question.text}
        </h1>

        <QuestionContent
          question={question}
          showCorrectAnswer={showCorrectAnswer}
        />
      </motion.div>
    );
  },
);
