import Image from "next/image";
import Link from "next/link";
import { HopeStudioNavLink } from "@/components/layout/HopeStudioNavLink";
import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { NavSearchGroup } from "@/components/layout/NavSearchGroup";
import { MAIN_NAV_LINKS } from "@/lib/constants";

const navItemClassName =
  "inline-flex items-center whitespace-nowrap px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85";

export function MainNav() {
  return (
    <nav
      className="border-b-2 border-[#5daae2] bg-hmc-primary text-white"
      aria-label="Main navigation"
    >
      <HeaderContainer className="min-h-[54px] gap-2 py-2">
        <Link
          href="/"
          className="mr-4 flex shrink-0 items-center lg:mr-6"
          aria-label="Hope Music Community home"
        >
          <Image
            src="/logo.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 object-contain brightness-0 invert"
            priority
          />
        </Link>

        <ul className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-x-3 lg:gap-x-5 xl:gap-x-6">
          {MAIN_NAV_LINKS.map((link) => (
            <li key={link.href} className="flex items-center">
              {link.variant === "hope-studio" ? (
                <HopeStudioNavLink href={link.href} />
              ) : (
                <Link href={link.href} className={navItemClassName}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        <div className="ml-4 shrink-0 lg:ml-6">
          <NavSearchGroup />
        </div>
      </HeaderContainer>
    </nav>
  );
}
