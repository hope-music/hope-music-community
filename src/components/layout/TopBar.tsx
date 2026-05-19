import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function TopBar() {
  return (
    <div className="bg-gradient-to-r from-[#141414] via-[#1f1f1f] to-[#2a2a2a] text-white">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <span className="text-sm font-semibold uppercase tracking-[0.22em]">
          {SITE_NAME}
        </span>
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/85">
          {SITE_TAGLINE}
        </span>
      </div>
    </div>
  );
}
