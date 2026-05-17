import Image from "next/image";
import Link from "next/link";
import { MAIN_NAV_LINKS } from "@/lib/constants";

export function MainNav() {
  return (
    <nav className="bg-hmc-primary text-white" aria-label="Main navigation">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label="Hope Music Community home">
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="h-10 w-10 object-contain invert"
            priority
          />
        </Link>

        <ul className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold uppercase tracking-wide">
          {MAIN_NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="site-search">
            Search
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="Search"
            className="h-7 w-28 border-0 bg-white px-2 text-xs text-hmc-text placeholder:text-hmc-text-muted sm:w-36"
          />
          <button
            type="button"
            className="h-7 bg-white px-2 text-[10px] font-semibold uppercase text-hmc-primary"
          >
            Search
          </button>
          <Link
            href="/login"
            className="hidden border border-white px-3 py-1 text-[10px] font-semibold uppercase hover:bg-white/10 sm:inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
