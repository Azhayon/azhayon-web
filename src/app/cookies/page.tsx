import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT_HREF, OPERATOR } from "@/lib/legal";
import { staticPageMetadata } from "@/lib/static-meta";

export const metadata = staticPageMetadata("Cookies", "Which cookies Azhayon Media uses and why.", "/cookies");

const COOKIES = [
  { name: "azm_theme", purpose: "Remembers your light or dark theme choice.", kind: "Preference", lasts: "1 year" },
  {
    name: "azm_session",
    purpose: "Keeps you signed in. Scripts on the page cannot read it.",
    kind: "Essential",
    lasts: "Until you sign out or your sign-in expires",
  },
  {
    name: "azm_oauth",
    purpose: "Protects the Google or Discord sign-in while you are sent there and back. Deleted when sign-in finishes.",
    kind: "Essential",
    lasts: "10 minutes at most",
  },
] as const;

export default function CookiesPage() {
  return (
    <LegalPage title="Cookies" updated={OPERATOR.lastUpdated}>
      <p>
        Cookies are small files a site stores in your browser. {OPERATOR.site} uses as few as it can.
      </p>

      <h2>Cookies we set</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">What it does</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 font-medium">Lasts</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((cookie) => (
              <tr key={cookie.name} className="border-b border-line align-top">
                <td className="py-2 pr-4 font-mono">{cookie.name}</td>
                <td className="py-2 pr-4">{cookie.purpose}</td>
                <td className="py-2 pr-4">{cookie.kind}</td>
                <td className="py-2">{cookie.lasts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Advertising cookies</h2>
      <p>
        When advertising is enabled, Google and its partners may set cookies or use similar technology to show and measure
        ads. Where the law requires it, you will be asked for your choice before they are used, and you will be able to
        change it later from this page. Until then, no advertising cookies are set by us.
      </p>

      <h2>Controlling cookies</h2>
      <p>
        You can delete or block cookies in your browser settings. The site still works without the theme cookie, but you
        will need to sign in again if you remove the sign-in cookie.
      </p>

      <h2>Questions</h2>
      <p>
        Email <a href={CONTACT_HREF}>{OPERATOR.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}