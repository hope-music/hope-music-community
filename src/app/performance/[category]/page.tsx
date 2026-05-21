import { CategoryListing } from "@/components/category/CategoryListing";
import { MOCK_PERFORMANCE_ITEMS } from "@/lib/mock-data";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function PerformanceCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  return (
    <CategoryListing
      category={category}
      items={MOCK_PERFORMANCE_ITEMS}
    />
  );
}
