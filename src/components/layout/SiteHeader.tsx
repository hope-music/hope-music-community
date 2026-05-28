"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { CooperationBar } from "@/components/layout/CooperationBar";
import { CooperationModal } from "@/components/cooperation/CooperationModal";
import { MainNav } from "@/components/layout/MainNav";
import { SubNav } from "@/components/layout/SubNav";
import { TopBar } from "@/components/layout/TopBar";

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [showCooperationModal, setShowCooperationModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50">
        {isHomePage && <TopBar />}
        <MainNav />
        <SubNav />
        <CooperationBar 
          isSubPage={!isHomePage} 
          onCooperationClick={() => setShowCooperationModal(true)} 
        />
      </header>
      <CooperationModal 
        isOpen={showCooperationModal} 
        onClose={() => setShowCooperationModal(false)} 
      />
    </>
  );
}
