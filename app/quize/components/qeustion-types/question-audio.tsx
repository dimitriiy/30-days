import { QeustionFooter } from "../qeustion-footer";
import { QuestionWrapper } from "../question-wrapper";
import { QuestionWithAudio } from "../../system";

export function QuestionAudio(props: {
  question: QuestionWithAudio;
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
      <audio src={props.question.audioUrl} controls />
    </QuestionWrapper>
  );
}
