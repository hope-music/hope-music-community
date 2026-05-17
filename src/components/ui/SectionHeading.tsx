import { type ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  action?: ReactNode;
};

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 border-b border-hmc-placeholder-border pb-2">
      <h2 className="text-2xl font-bold text-hmc-orange">{title}</h2>
      {action}
    </div>
  );
}
