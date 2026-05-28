"use client";

type CooperationBarProps = {
  isSubPage?: boolean;
  onCooperationClick?: () => void;
  onBusinessClick?: () => void;
};

export function CooperationBar({ isSubPage = false, onCooperationClick, onBusinessClick }: CooperationBarProps) {
  if (isSubPage) {
    return (
      <div className="h-[3px] w-full bg-[#D96A32]" />
    );
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-4 lg:px-8">
      <div
        className="flex h-8 items-center border-b border-[#D96A32]"
        style={{ borderTop: "1px solid #D96A32" }}
      >
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider" style={{ color: "#D96A32" }}>
              COOPERATION
            </span>
            <div
              className="h-4 w-px shrink-0"
              style={{ backgroundColor: "#D96A32" }}
            />
            <button
              onClick={onCooperationClick}
              className="shrink-0 text-[11px] font-medium transition-colors hover:text-[#D96A32] cursor-pointer"
              style={{ color: "#333333" }}
            >
              WELCOME TO OUR MUSICAL PERFORMANCE TEAM
            </button>
          </div>
          <button
            onClick={onBusinessClick}
            className="shrink-0 text-[11px] font-medium transition-colors hover:text-[#D96A32] cursor-pointer"
            style={{ color: "#333333" }}
          >
            WE LOOK FORWARD TO COOPERATING WITH YOU ON ALL TYPES OF MUSIC BUSINESS PROJECTS
          </button>
        </div>
      </div>
    </div>
  );
}
