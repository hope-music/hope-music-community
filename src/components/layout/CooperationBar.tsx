"use client";

type CooperationBarProps = {
  isSubPage?: boolean;
  onCooperationClick?: () => void;
  onBusinessClick?: () => void;
};

export function CooperationBar({ isSubPage = false, onCooperationClick, onBusinessClick }: CooperationBarProps) {
  if (isSubPage) {
    return (
      <div className="h-[3px] w-full bg-hmc-orange" />
    );
  }

  return (
    <div className="mx-auto max-w-6xl bg-white px-4 lg:px-8">
      <div
        className="flex h-8 items-center border-b border-hmc-orange"
        style={{ borderTop: "1px solid var(--hmc-orange)" }}
      >
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-hmc-orange">
              COOPERATION
            </span>
            <div
              className="h-4 w-px shrink-0"
              style={{ backgroundColor: "var(--hmc-orange)" }}
            />
            <button
              onClick={onCooperationClick}
              className="shrink-0 text-[11px] font-medium transition-colors hover:text-hmc-orange cursor-pointer text-hmc-text"
            >
              WELCOME TO OUR MUSICAL PERFORMANCE TEAM
            </button>
          </div>
          <button
            onClick={onBusinessClick}
            className="shrink-0 text-[11px] font-medium transition-colors hover:text-hmc-orange cursor-pointer text-hmc-text"
          >
            WE LOOK FORWARD TO COOPERATING WITH YOU ON ALL TYPES OF MUSIC BUSINESS PROJECTS
          </button>
        </div>
      </div>
    </div>
  );
}
