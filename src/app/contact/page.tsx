import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT_HREF, OPERATOR } from "@/lib/legal";
import { staticPageMetadata } from "@/lib/static-meta";

export const metadata = staticPageMetadata("Contact", "How to contact Azhayon Media.", "/contact");

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        The best way to reach us is by email: <a href={CONTACT_HREF}>{OPERATOR.contactEmail}</a>.
      </p>
      <h2>What to write to us about</h2>
      <ul>
        <li>Corrections to a post.</li>
        <li>Questions about your data or your account (see the Privacy page).</li>
        <li>Advertising, partnerships and other business enquiries.</li>
        <li>
          Copyright concerns: if you own content shown here and think it should not be, send the address of the page and
          a short explanation, and we will look into it.
        </li>
      </ul>
      <p>We read every message, but we cannot promise a reply to each one.</p>
    </LegalPage>
  );
}