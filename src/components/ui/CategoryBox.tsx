"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";

type CategoryBoxProps = {
  title: string;
  children?: ReactNode;
  headerVariant?: "default" | "interaction";
  headerAction?: ReactNode;
  categoryHref?: string;
};

export function CategoryBox({
  title,
  children,
  headerVariant = "default",
  headerAction,
  categoryHref,
}: CategoryBoxProps) {
  const router = useRouter();
  const headerClasses =
    headerVariant === "interaction"
      ? "bg-hmc-interaction-header text-white"
      : "bg-hmc-placeholder text-hmc-text";

  const handleHeaderClick = () => {
    if (categoryHref) {
      router.push(categoryHref);
    }
  };

  return (
    <section className="flex min-h-[140px] flex-col border border-hmc-placeholder-border">
      <header
        className={`flex items-center justify-center px-2 py-1 text-center text-xs font-bold uppercase tracking-wide ${headerClasses}`}
        onClick={handleHeaderClick}
        style={{ cursor: categoryHref ? "pointer" : "default" }}
      >
        <span className="flex-1">{title}</span>
        {headerAction}
      </header>
      <div className="flex flex-1 flex-col bg-hmc-placeholder p-2">
        {children ?? <div className="min-h-[80px] flex-1" aria-hidden />}
      </div>
    </section>
  );
}
