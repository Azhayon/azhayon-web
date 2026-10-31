import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT_HREF, OPERATOR } from "@/lib/legal";
import { staticPageMetadata } from "@/lib/static-meta";

export const metadata = staticPageMetadata("Terms of Use", "The rules for using Azhayon Media.", "/terms");

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated={OPERATOR.lastUpdated}>
      <p>
        By using {OPERATOR.site} you agree to these terms. If you do not agree, please do not use the site.
      </p>

      <h2>Using the site</h2>
      <p>
        You may read and share links to our posts. Do not misuse the site: no attempts to break or overload it, to get
        into accounts that are not yours, or to copy it automatically at scale.
      </p>

      <h2>Accounts</h2>
      <p>
        You sign in with Google or Discord. You are responsible for what happens under your account. We may suspend or
        remove an account that breaks these terms.
      </p>

      <h2>Comments and ratings</h2>
      <ul>
        <li>You keep ownership of what you write. By posting, you let us display it on the site.</li>
        <li>
          Do not post anything unlawful, hateful, harassing, misleading or spammy, and do not post links to pirated
          content.
        </li>
        <li>Mark or avoid spoilers where you can.</li>
        <li>We may remove any comment or rating at our discretion.</li>
      </ul>

      <h2>Our content</h2>
      <p>
        The articles, layout and original images on this site belong to {OPERATOR.owner} unless stated otherwise. Do not
        republish them without permission, though short quotes with a link back are welcome. Names, images and trademarks
        of films, series, books and studios belong to their owners and appear here to identify and discuss them.
      </p>

      <h2>Reviews and opinions</h2>
      <p>
        Reviews, scores and articles are opinions and are provided for information and entertainment. We try to be
        accurate but do not promise that everything is complete or error-free.
      </p>

      <h2>Links to other sites</h2>
      <p>We link to other sites and are not responsible for their content or privacy practices.</p>

      <h2>No warranty and limits on liability</h2>
      <p>
        The site is provided as it is, without promises that it will always be available or free of errors. To the extent
        the law allows, we are not liable for losses that come from using the site.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms. The date at the top shows the latest version. Using the site afterwards means you accept the change.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href={CONTACT_HREF}>{OPERATOR.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}