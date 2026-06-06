import Link from "next/link";

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "Facebook", href: "#", icon: "f" },
  { label: "Twitter", href: "#", icon: "x" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-hmc-footer py-8 text-center">
      <ul className="mb-4 flex justify-center gap-4">
        {SOCIAL_LINKS.map((social) => (
          <li key={social.label}>
            <Link
              href={social.href}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-hmc-text-muted/20 text-xs font-bold text-hmc-text hover:bg-hmc-text-muted/30"
              aria-label={social.label}
            >
              {social.icon}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mb-2 text-xs text-hmc-text-muted">
        Contact Email: <a href="mailto:hope_music@outlook.com" className="hover:text-hmc-orange">hope_music@outlook.com</a>
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-hmc-text-muted">
        Copyright © 2024 Hope Music Community. All rights reserved.
      </p>
    </footer>
  );
}
