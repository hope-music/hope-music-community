import Link from "next/link";

type ViewMoreButtonProps = {
  href?: string;
  className?: string;
  size?: "sm" | "md";
};

export function ViewMoreButton({
  href = "#",
  className = "",
  size = "md",
}: ViewMoreButtonProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block bg-hmc-red font-semibold text-white transition-colors hover:bg-hmc-red-hover ${sizeClasses} ${className} normal-case`}
    >
      View Details
    </Link>
  );
}