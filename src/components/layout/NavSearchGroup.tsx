"use client";

import { FormEvent, useState } from "react";

export function NavSearchGroup() {
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const href = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center"
      role="search"
      aria-label="Site search"
    >
      <label htmlFor="nav-search-input" className="sr-only">
        Search keywords
      </label>
      <input
        id="nav-search-input"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-6 w-[100px] border-0 bg-white px-2.5 text-[11px] text-hmc-text outline-none sm:w-[116px]"
      />
      <button
        type="submit"
        className="inline-flex cursor-pointer items-center whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-85 lg:px-4"
      >
        Search
      </button>
    </form>
  );
}
