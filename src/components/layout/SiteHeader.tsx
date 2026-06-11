"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { CooperationBar } from "@/components/layout/CooperationBar";
import { CooperationModal } from "@/components/cooperation/CooperationModal";
import { BusinessCooperationModal } from "@/components/cooperation/BusinessCooperationModal";
import { MainNav } from "@/components/layout/MainNav";
import { SubNav } from "@/components/layout/SubNav";
import { TopBar } from "@/components/layout/TopBar";

export function SiteHeader() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [showCooperationModal, setShowCooperationModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  useEffect(() => {
    const handleOpenCooperation = () => setShowCooperationModal(true);
    const handleOpenBusiness = () => setShowBusinessModal(true);
    
    window.addEventListener('openCooperationModal', handleOpenCooperation);
    window.addEventListener('openBusinessCooperationModal', handleOpenBusiness);
    
    return () => {
      window.removeEventListener('openCooperationModal', handleOpenCooperation);
      window.removeEventListener('openBusinessCooperationModal', handleOpenBusiness);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50">
        {isHomePage && <TopBar />}
        <MainNav />
        <SubNav />
        <CooperationBar 
          isSubPage={!isHomePage} 
          onCooperationClick={() => setShowCooperationModal(true)}
          onBusinessClick={() => setShowBusinessModal(true)}
        />
      </header>
      <CooperationModal 
        isOpen={showCooperationModal} 
        onClose={() => setShowCooperationModal(false)} 
      />
      <BusinessCooperationModal 
        isOpen={showBusinessModal} 
        onClose={() => setShowBusinessModal(false)} 
      />
    </>
  );
}
