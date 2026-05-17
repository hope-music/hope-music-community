import { type ReactNode } from "react";

type CategoryBoxProps = {
  title: string;
  children?: ReactNode;
  headerVariant?: "default" | "interaction";
  headerAction?: ReactNode;
};

export function CategoryBox({
  title,
  children,
  headerVariant = "default",
  headerAction,
}: CategoryBoxProps) {
  const headerClasses =
    headerVariant === "interaction"
      ? "bg-hmc-interaction-header text-white"
      : "bg-hmc-placeholder text-hmc-text";

  return (
    <section className="flex min-h-[140px] flex-col border border-hmc-placeholder-border">
      <header
        className={`flex items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wide ${headerClasses}`}
      >
        <span>{title}</span>
        {headerAction}
      </header>
      <div className="flex flex-1 flex-col bg-hmc-placeholder p-2">
        {children ?? <div className="min-h-[80px] flex-1" aria-hidden />}
      </div>
    </section>
  );
}
