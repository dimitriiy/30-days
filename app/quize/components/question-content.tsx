import {
  isQuestionWithAudio,
  isQuestionWithVideo,
  isQuestionWithImage,
  Question,
} from "../system";
import { QuestionAudio } from "./qeustion-types/question-audio";
import { QuestionImage } from "./qeustion-types/question-image";
import { QuestionText } from "./qeustion-types/question-text";
import { QuestionVideo } from "./qeustion-types/question-video";

type QuestionContentProps = {
  question: Question;
  showCorrectAnswer: boolean;
};

export function QuestionContent({
  question,
  showCorrectAnswer,
}: QuestionContentProps) {
  if (isQuestionWithAudio(question)) {
    return (
      <QuestionAudio
        question={question}
        showCorrectAnswer={showCorrectAnswer}
      />
    );
  }

  if (isQuestionWithVideo(question)) {
    return (
      <QuestionVideo
        question={question}
        showCorrectAnswer={showCorrectAnswer}
      />
    );
  }

  if (isQuestionWithImage(question)) {
    return (
      <QuestionImage question={question} showCorrectAnswer={showCorrectAnswer} />
    );
  }

  return (
    <QuestionText question={question} showCorrectAnswer={showCorrectAnswer} />
  );
}
