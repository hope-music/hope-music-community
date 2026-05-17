import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function TopBar() {
  return (
    <div className="bg-hmc-topbar text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest sm:px-6 lg:px-8">
        <span>{SITE_NAME}</span>
        <span className="text-white/80">{SITE_TAGLINE}</span>
      </div>
    </div>
  );
}
