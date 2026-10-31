import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT_HREF, OPERATOR } from "@/lib/legal";
import { staticPageMetadata } from "@/lib/static-meta";

export const metadata = staticPageMetadata(
  "About",
  "About Azhayon Media: news, reviews and guides on movies, anime, manhwa and manga.",
  "/about",
);

export default function AboutPage() {
  return (
    <LegalPage title="About Azhayon Media">
      <p>
        {OPERATOR.site} is a site about movies, anime, manhwa and manga. We publish news, reviews, explainers and lists,
        written for people who like to know what to watch or read next.
      </p>
      <h2>Who runs it</h2>
      <p>
        The site is created and run by {OPERATOR.owner}. You can reach us at <a href={CONTACT_HREF}>{OPERATOR.contactEmail}</a>.
      </p>
      <h2>How we write</h2>
      <ul>
        <li>Reviews are one person’s opinion. Scores run from 0 to 10.</li>
        <li>Plot details that could ruin a story are hidden behind a spoiler button, so you choose whether to see them.</li>
        <li>If we get something wrong, tell us and we will correct it.</li>
      </ul>
      <h2>How the site is paid for</h2>
      <p>
        The site may show advertising. Ads do not change what we write or how we score things. Names, images and
        trademarks of films, series and books belong to their owners and are used here to identify and discuss them.
      </p>
    </LegalPage>
  );
}