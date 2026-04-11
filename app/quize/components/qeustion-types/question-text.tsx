import { AnimatePresence, motion } from "motion/react";
import { BaseQuestion } from "../../system";
import { QeustionFooter } from "../qeustion-footer";
import { QuestionWrapper } from "../question-wrapper";

export function QuestionText(props: {
  question: BaseQuestion;
  showCorrectAnswer: boolean;
}) {
  return (
    <QuestionWrapper
      footer={
        <QeustionFooter
          question={props.question}
          showCorrectAnswer={props.showCorrectAnswer}
        />
      }
    >
      {/* <AnimatePresence>
        {props.showCorrectAnswer && (
          <motion.span
            key="modal"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <span className="text-5xl font-bold">
              {props.question.correctAnswer}
            </span>
          </motion.span>
        )}
      </AnimatePresence> */}
    </QuestionWrapper>
  );
}
