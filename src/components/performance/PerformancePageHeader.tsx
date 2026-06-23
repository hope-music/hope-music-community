interface PerformancePageHeaderProps {
  title: string;
  totalCount: number;
}

const DISCLAIMER =
  "Notice: This is a free informational guide only — we do not sell tickets. " +
  "Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster.";

export function PerformancePageHeader({ title, totalCount }: PerformancePageHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-1">{totalCount} events in database</p>
      <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        {DISCLAIMER}
      </p>
    </div>
  );
}
