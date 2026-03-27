import { ReactNode } from "react";

type QuestionWrapperProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function QuestionWrapper({ children, footer }: QuestionWrapperProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 items-center justify-center">{children}</div>
      {footer}
    </div>
  );
}
