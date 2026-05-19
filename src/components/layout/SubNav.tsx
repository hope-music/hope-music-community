import Link from "next/link";
import { SUB_NAV_LINKS } from "@/lib/constants";

export function SubNav() {
  return (
    <nav
      className="border-b border-hmc-placeholder-border bg-white"
      aria-label="Section navigation"
    >
      <ul className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-hmc-text-muted sm:px-6 lg:px-8">
        {SUB_NAV_LINKS.map((link, index) => (
          <li key={link.href} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-hmc-placeholder-border" aria-hidden>
                |
              </span>
            )}
            <Link href={link.href} className="transition-colors hover:text-hmc-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
