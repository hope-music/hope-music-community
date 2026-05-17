import { Container } from "@/components/ui/Container";

type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Container className="flex flex-1 flex-col justify-center py-16">
      <h1 className="mb-2 text-3xl font-bold text-hmc-orange">{title}</h1>
      <p className="max-w-lg text-hmc-text-muted">
        {description ??
          "This page is a placeholder. Content and data wiring will be added in a future pass."}
      </p>
    </Container>
  );
}
