"use client";

import { usePathname } from "next/navigation";
import { CooperationBar } from "@/components/layout/CooperationBar";
import { MainNav } from "@/components/layout/MainNav";
import { SubNav } from "@/components/layout/SubNav";
import { TopBar } from "@/components/layout/TopBar";

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <header className="sticky top-0 z-50">
      {isHomePage && <TopBar />}
      <MainNav />
      <SubNav />
      <CooperationBar isSubPage={!isHomePage} />
    </header>
  );
}
