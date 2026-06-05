import SearchPageClient from "@/components/search/SearchPageClient";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";

  return <SearchPageClient initialQuery={query} />;
}
