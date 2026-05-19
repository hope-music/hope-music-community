import { HeaderContainer } from "@/components/layout/HeaderContainer";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function TopBar() {
  return (
    <div className="bg-gradient-to-r from-[rgb(20,20,20)] via-[rgb(38,38,38)] to-[rgb(20,20,20)] text-white">
      <HeaderContainer className="justify-end pt-6 pb-2">
        <div className="flex flex-col items-end gap-1 text-right">
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
