import Link from "next/link";
import { SUB_NAV_LINKS } from "@/lib/constants";

export function SubNav() {
  return (
    <nav
      className="border-b border-hmc-placeholder-border bg-hmc-subnav"
      aria-label="Section navigation"
    >
      <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-4 gap-y-1 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-hmc-text sm:px-6 lg:px-8">
        {SUB_NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-hmc-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
