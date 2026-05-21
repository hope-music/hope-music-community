import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const TOP_BAR_GRADIENT = "#2a2a2a";

export function TopBar() {
  return (
    <div className="text-white" style={{ background: TOP_BAR_GRADIENT }}>
      <HeaderContainer className="min-h-[52px]">
        <div className="flex flex-col items-start gap-0 text-left" style={{ paddingTop: '14px' }}>
          <p className="whitespace-nowrap text-[13px] font-semibold uppercase leading-none tracking-[0.26em]">
            {SITE_NAME}
          </p>
          <p className="whitespace-nowrap text-[10px] font-medium uppercase leading-none tracking-[0.34em] text-white/90">
            {SITE_TAGLINE}
          </p>
        </div>
      </HeaderContainer>
    </div>
  );
}
