export type FooterLink = { label: string; href: string };

/** Site pages for the footer. The pages themselves arrive in step 6.7. */
export const FOOTER_LINKS: readonly FooterLink[] = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookie settings", href: "/cookies" },
];