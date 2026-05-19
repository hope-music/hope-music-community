import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { COMMUNITY_TICKER_MESSAGE } from "@/lib/constants";

export function SubNav() {
  return (
    <nav
      className="border-b border-hmc-placeholder-border bg-white"
      aria-label="Community announcements"
    >
      <HeaderContainer className="h-9 min-h-9 justify-between gap-4">
        <span className="shrink-0 text-xs font-bold uppercase tracking-[0.1em] text-black">
          Community
        </span>
        <p className="min-w-0 truncate text-[10px] font-medium text-hmc-text">
          {COMMUNITY_TICKER_MESSAGE}
        </p>
      </HeaderContainer>
    </nav>
  );
}
