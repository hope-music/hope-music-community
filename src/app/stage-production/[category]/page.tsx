import { StageProductionListing } from "@/components/category/StageProductionListing";
import { MOCK_STAGE_PRODUCTION_ITEMS } from "@/lib/mock-stage-production-data";

const VALID_CATEGORIES = [
  "stage", "video", "lighting", "audio",
  "effects", "costumes", "props", "makeup", "others",
];

interface StageProductionCategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function StageProductionCategoryPage({
  params,
}: StageProductionCategoryPageProps) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category)) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Category Not Found
          </h1>
          <p className="text-gray-500">
            The stage production category &quot;{category}&quot; does not exist.
          </p>
        </div>
      </main>
    );
  }

  const filteredItems = MOCK_STAGE_PRODUCTION_ITEMS.filter(
    (item) => item.category === category
  );

  return (
    <StageProductionListing
      category={category}
      items={filteredItems}
      basePath={`/stage-production/${category}`}
    />
  );
}
