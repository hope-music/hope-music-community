interface PerformancePageHeaderProps {
  title: string;
  totalCount: number;
}

export function PerformancePageHeader({ title, totalCount }: PerformancePageHeaderProps) {
  return (
    <div className="mb-6 pb-4 border-b border-gray-200">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-500 mt-1">{totalCount} events in database</p>
    </div>
  );
}
