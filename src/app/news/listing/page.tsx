import { CategoryListing } from "@/components/category/CategoryListing";
import { MOCK_NEWS_ITEMS } from "@/lib/mock-data";

export default function NewsListingPage() {
  return <CategoryListing category="News" items={MOCK_NEWS_ITEMS} />;
}
