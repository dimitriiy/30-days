"use client";

interface ProgramContentProps {
  items: string[];
}

export const ProgramContent = ({ items }: ProgramContentProps) => {
  return (
    <div className="content">
      {items.map((text, index) => (
        <div key={index} className="mb-2">
          {text}
        </div>
      ))}
    </div>
  );
};
