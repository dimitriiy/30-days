import { QeustionFooter } from "../qeustion-footer";
import { QuestionWrapper } from "../question-wrapper";
import { QuestionWithVideo } from "../../system";

export function QuestionVideo(props: {
  question: QuestionWithVideo;
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
      <video
        src={props.question.videoUrl}
        controls
        className="max-h-full max-w-full rounded-lg object-contain"
      />
    </QuestionWrapper>
  );
}
