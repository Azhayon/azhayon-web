import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT_HREF, OPERATOR } from "@/lib/legal";
import { staticPageMetadata } from "@/lib/static-meta";

export const metadata = staticPageMetadata(
  "Privacy Policy",
  "What personal data Azhayon Media collects, why, and the choices you have.",
  "/privacy",
);

const EXT = "noopener noreferrer";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={OPERATOR.lastUpdated}>
      <p>
        This page explains what personal data {OPERATOR.site} (run by {OPERATOR.owner}) collects, why we collect it, and
        what you can do about it. Some features below, such as comments, ratings, the newsletter and advertising, apply
        only once they are available on the site.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Sign-in details.</strong> If you sign in with Google or Discord, we receive your name, your email
          address (if the provider shares it), your profile picture and your account ID with that provider. We never
          receive your password.
        </li>
        <li>
          <strong>Comments and ratings.</strong> What you write or rate, the time, and the name shown with it. These are
          shown publicly next to the post.
        </li>
        <li>
          <strong>Newsletter.</strong> If you subscribe, your email address and whether you confirmed it.
        </li>
        <li>
          <strong>Technical data.</strong> Your IP address, browser type and the pages you request. We use this to run
          the site, protect it from abuse (for example by limiting how many requests one visitor can make) and keep
          simple counts of how often posts are read.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To let you sign in, comment and rate.</li>
        <li>To send the newsletter, only to people who asked for it.</li>
        <li>To keep the site secure and fast, and to see which posts are popular.</li>
        <li>To show advertising, as explained below.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use a small number of cookies to remember your theme and keep you signed in. Advertising partners may set
        others. See the <a href="/cookies">Cookies page</a> for the list.
      </p>

      <h2>Advertising</h2>
      <p>
        The site may show ads from Google AdSense. Google and its partners may use cookies and similar technology to show
        ads based on your visits to this and other sites. Where the law requires it, we will ask for your consent first,
        and you will be able to change your choice from the Cookie settings link. You can learn how Google uses data
        from sites like this at{" "}
        <a href="https://policies.google.com/technologies/partner-sites" rel={EXT}>
          policies.google.com/technologies/partner-sites
        </a>
        , and manage your ad personalisation at{" "}
        <a href="https://adssettings.google.com" rel={EXT}>
          adssettings.google.com
        </a>
        .
      </p>

      <h2>Other services we use</h2>
      <ul>
        <li>Google and Discord, for signing in.</li>
        <li>
          YouTube, for embedded videos. A video shows a preview picture first, which is loaded from YouTube’s image
          servers. The player itself loads only after you click it, using YouTube’s privacy-enhanced mode.
        </li>
        <li>X (Twitter) posts are shown as plain cards that link to X. We do not load X’s own scripts.</li>
        <li>A hosting provider, a content delivery and security service, and an email service for the newsletter.</li>
      </ul>

      <h2>How long we keep data</h2>
      <p>
        We keep account details for as long as your account exists, and comments and ratings for as long as the post they
        belong to is on the site. Technical logs are kept for a limited time for security.
      </p>

      <h2>Your choices</h2>
      <p>
        You can sign out at any time, unsubscribe from the newsletter using the link in any email, and change your cookie
        choices. To ask what data we hold about you, or to ask us to correct or delete it, email{" "}
        <a href={CONTACT_HREF}>{OPERATOR.contactEmail}</a>. We will consider each request and answer you.
      </p>

      <h2>Children</h2>
      <p>The site is not meant for children under 13, and we do not knowingly collect their data.</p>

      <h2>Security</h2>
      <p>
        We use HTTPS and keep sign-in tokens in protected cookies that scripts on the page cannot read. No system is
        completely secure, so we cannot guarantee absolute safety.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy, we will update the date at the top of this page.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy: <a href={CONTACT_HREF}>{OPERATOR.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}