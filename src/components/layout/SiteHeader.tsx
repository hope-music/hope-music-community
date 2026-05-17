import { MainNav } from "@/components/layout/MainNav";
import { SubNav } from "@/components/layout/SubNav";
import { TopBar } from "@/components/layout/TopBar";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <TopBar />
      <MainNav />
      <SubNav />
    </header>
  );
}
