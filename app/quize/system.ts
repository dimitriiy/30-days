export interface BaseQuestion {
  id: number;
  text: string;
  options: string[] | null;
  correctAnswer: string | null;
  timerDuration?: number;
}

export interface QuestionWithAudio extends BaseQuestion {
  audioUrl: string;
}

export interface QuestionWithVideo extends BaseQuestion {
  videoUrl: string;
}

export interface QuestionWithImage extends BaseQuestion {
  imageUrl: string;
}

export type Question =
  | BaseQuestion
  | QuestionWithAudio
  | QuestionWithVideo
  | QuestionWithImage;

export interface QuizeState {
  questions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
}

export const isBaseQuestion = (
  question: Question,
): question is BaseQuestion => {
  return "options" in question && "correctAnswer" in question;
};

export const isQuestionWithAudio = (
  question: Question,
): question is QuestionWithAudio =>
  "audioUrl" in question &&
  "options" in question &&
  "correctAnswer" in question;

export const isQuestionWithVideo = (
  question: Question,
): question is QuestionWithVideo =>
  "videoUrl" in question &&
  "options" in question &&
  "correctAnswer" in question;

export const isQuestionWithImage = (
  question: Question,
): question is QuestionWithImage =>
  "imageUrl" in question &&
  "options" in question &&
  "correctAnswer" in question;

export const isQuestionWithText = (
  question: Question,
): question is BaseQuestion =>
  !isQuestionWithAudio(question) &&
  !isQuestionWithVideo(question) &&
  !isQuestionWithImage(question);
