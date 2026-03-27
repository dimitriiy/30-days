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
      {null}
    </QuestionWrapper>
  );
}
