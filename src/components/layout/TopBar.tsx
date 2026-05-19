import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function TopBar() {
  return (
    <div className="bg-gradient-to-r from-[#111111] via-[#222222] to-[#111111] text-white">
      <HeaderContainer className="h-[60px] min-h-[60px] justify-end">
        <div className="flex flex-col items-end justify-center gap-1 text-right">
          <p className="whitespace-nowrap text-[13px] font-semibold uppercase leading-tight tracking-[0.26em]">
            {SITE_NAME}
          </p>
          <p className="whitespace-nowrap text-[10px] font-medium uppercase leading-tight tracking-[0.34em] text-white/90">
            {SITE_TAGLINE}
          </p>
        </div>
      </HeaderContainer>
    </div>
  );
}
