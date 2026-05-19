import Link from "next/link";

type HopeStudioNavLinkProps = {
  href: string;
  className?: string;
};

/** "Hope" script on top; "STUDIO" sans-serif below — stacked vertically. */
export function HopeStudioNavLink({ href, className = "" }: HopeStudioNavLinkProps) {
  return (
    <Link
      href={href}
      className={`flex min-w-[3.25rem] flex-col items-center justify-center px-3 py-1.5 text-center text-white transition-opacity hover:opacity-85 ${className}`}
    >
      <span className="font-hope-studio text-[17px] font-semibold leading-[1.05] tracking-normal">
        Hope
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.14em]">
        Studio
      </span>
    </Link>
  );
}
