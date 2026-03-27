import { QeustionFooter } from "../qeustion-footer";
import { QuestionWrapper } from "../question-wrapper";
import { QuestionWithImage } from "../../system";

export function QuestionImage(props: {
  question: QuestionWithImage;
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
      <img
        src={props.question.imageUrl}
        alt={props.question.text}
        className="max-h-full max-w-full rounded-lg object-contain"
      />
    </QuestionWrapper>
  );
}
