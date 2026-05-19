import Image from "next/image";
import Link from "next/link";
import { MAIN_NAV_LINKS } from "@/lib/constants";

const navLinkClassName =
  "px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:text-white/75 hover:underline hover:underline-offset-[6px] hover:decoration-white/50";

export function MainNav() {
  return (
    <nav className="bg-hmc-primary text-white" aria-label="Main navigation">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="mr-2 shrink-0" aria-label="Hope Music Community home">
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 object-contain invert"
            priority
          />
        </Link>

        <ul className="flex flex-1 flex-wrap items-center justify-start gap-x-1 gap-y-1 lg:gap-x-2">
          {MAIN_NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={navLinkClassName}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
