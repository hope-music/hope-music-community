import { type ReactNode } from "react";

type HeaderContainerProps = {
  children: ReactNode;
  className?: string;
};

/** Shared horizontal alignment for all header rows. */
export function HeaderContainer({ children, className = "" }: HeaderContainerProps) {
  return (
    <div
      className={`mx-auto flex w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
