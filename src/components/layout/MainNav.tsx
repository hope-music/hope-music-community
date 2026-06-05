"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HopeStudioNavLink } from "@/components/layout/HopeStudioNavLink";
import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { NavSearchGroup } from "@/components/layout/NavSearchGroup";
import { UserMenu } from "@/components/layout/UserMenu";
import { MAIN_NAV_LINKS } from "@/lib/constants";

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav
      className="border-b-[6px] border-[#60A5FA] text-white"
      style={{ background: "var(--hmc-mainnav-bg)" }}
      aria-label="Main navigation"
    >
      <HeaderContainer className="relative flex h-[90px] flex-nowrap items-center justify-between gap-4 py-8">
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

        <ul className="flex flex-1 flex-nowrap items-center justify-center gap-x-1 overflow-visible sm:gap-x-2 lg:gap-x-4 xl:gap-x-5">
          {MAIN_NAV_LINKS.map((link) => {
            if (link.href === "/performance") {
              return (
                <li key={link.href} className="relative">
                  <PerformanceNavLink
                    href={link.href}
                    isActive={pathname.startsWith(link.href)}
                  />
                </li>
              );
            }
            if (link.href === "/stage-production") {
              return (
                <li key={link.href} className="relative">
                  <StageProductionNavLink
                    href={link.href}
                    isActive={pathname.startsWith(link.href)}
                  />
                </li>
              );
            }
            if (link.href === "/interaction") {
              return (
                <li key={link.href} className="relative">
                  <InteractionNavLink
                    href={link.href}
                    isActive={pathname.startsWith(link.href)}
                  />
                </li>
              );
            }
            if (link.variant === "hope-studio") {
              return (
                <li key={link.href} className="flex items-center">
                  <HopeStudioNavLink href={link.href} />
                </li>
              );
            }
            return (
              <li key={link.href} className="flex items-center">
                <NavLink
                  href={link.href}
                  label={link.label}
                  isActive={pathname.startsWith(link.href)}
                  external={!!(link as { external?: boolean }).external}
                />
              </li>
            );
          })}
        </ul>

        <div className="ml-4 shrink-0 lg:ml-6">
          <NavSearchGroup />
        </div>
      </HeaderContainer>
    </nav>
  );
}

const PERFORMANCE_ITEMS = [
  { label: "Legend Hall of Fame", slug: "legend-hall-of-fame" },
  { label: "Musical", slug: "musical" },
  { label: "Classical", slug: "classical" },
  { label: "EDM", slug: "edm" },
  { label: "Legendary Rock", slug: "legendary-rock" },
  { label: "Legendary Pop", slug: "legendary-pop" },
  { label: "Festival", slug: "festival" },
  { label: "Ballet", slug: "ballet" },
  { label: "Others", slug: "others" },
  { label: "Featured", slug: "", isFeatured: true },
];

const STAGE_PRODUCTION_ITEMS = [
  { label: "Stage", slug: "stage" },
  { label: "Video", slug: "video" },
  { label: "Lighting", slug: "lighting" },
  { label: "Audio", slug: "audio" },
  { label: "Effects", slug: "effects" },
  { label: "Costumes", slug: "costumes" },
  { label: "Props", slug: "props" },
  { label: "Makeup", slug: "makeup" },
  { label: "Others", slug: "others" },
];

const INTERACTION_ITEMS = [
  { label: "Software", slug: "software" },
  { label: "Hardware", slug: "hardware" },
  { label: "Music", slug: "music" },
  { label: "Stage Production", slug: "stage-production" },
  { label: "Article", slug: "artical" },
  { label: "Others", slug: "others" },
];

function PerformanceNavLink({ href, isActive }: { href: string; isActive: boolean }) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={`relative inline-flex items-center whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:opacity-85 lg:px-4 ${
          isActive ? "opacity-100" : "opacity-80"
        }`}
      >
        PERFORMANCE
        {isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D96A32]" />
        )}
        {/* Dropdown caret */}
        <svg
          className="ml-1.5 h-2.5 w-2.5 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      {/* Dropdown — left-aligned with nav item, flush to bottom, light-blue theme */}
      <div
        className="pointer-events-none absolute left-0 top-full z-50 mt-0 w-52 rounded-b-xl border border-[#28779E]/20 bg-[#4A9BC8] py-2 shadow-xl opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        {PERFORMANCE_ITEMS.map((item) => (
          <a
            key={item.slug || "featured"}
            href={item.isFeatured ? "/performance" : `/performance/${item.slug}`}
            target={item.isFeatured ? "_self" : "_blank"}
            rel="noopener noreferrer"
            className={`flex items-center px-5 py-3 text-[13px] font-medium transition-colors duration-150 ${
              item.isFeatured
                ? "text-yellow-300 hover:bg-yellow-500/20"
                : "text-white hover:bg-white/20"
            }`}
          >
            {item.isFeatured && (
              <span className="mr-2 text-yellow-300">★</span>
            )}
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function StageProductionNavLink({ href, isActive }: { href: string; isActive: boolean }) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={`relative inline-flex items-center whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:opacity-85 lg:px-4 ${
          isActive ? "opacity-100" : "opacity-80"
        }`}
      >
        STAGE PRODUCTION
        {isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D96A32]" />
        )}
        <svg
          className="ml-1.5 h-2.5 w-2.5 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      {/* Dropdown — left-aligned with nav item, flush to bottom, light-blue theme */}
      <div
        className="pointer-events-none absolute left-0 top-full z-50 mt-0 w-52 rounded-b-xl border border-[#28779E]/20 bg-[#4A9BC8] py-2 shadow-xl opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
      >
        {STAGE_PRODUCTION_ITEMS.map((item) => (
          <a
            key={item.slug}
            href={`/stage-production/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-5 py-3 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-white/20 hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function InteractionNavLink({ href, isActive }: { href: string; isActive: boolean }) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={`relative inline-flex items-center whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:opacity-85 lg:px-4 ${
          isActive ? "opacity-100" : "opacity-80"
        }`}
      >
        INTERACTION
        {isActive && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D96A32]" />
        )}
        <svg
          className="ml-1.5 h-2.5 w-2.5 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      {/* Dropdown — left-aligned with nav item, flush to bottom, light-blue theme */}
      <div className="pointer-events-none absolute left-0 top-full z-50 mt-0 w-52 rounded-b-xl border border-[#28779E]/20 bg-[#4A9BC8] py-2 shadow-xl opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        {INTERACTION_ITEMS.map((item) => (
          <a
            key={item.slug}
            href={`/interaction/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-5 py-3 text-[13px] font-medium text-white transition-colors duration-150 hover:bg-white/20 hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  isActive,
  external = false,
}: {
  href: string;
  label: string;
  isActive: boolean;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`relative inline-flex items-center whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-150 hover:opacity-85 lg:px-4 ${
        isActive ? "opacity-100" : "opacity-80"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D96A32]" />
      )}
    </Link>
  );
}
