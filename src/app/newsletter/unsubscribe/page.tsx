import type { Metadata } from "next";
import { TokenPage } from "@/components/newsletter/TokenPage";
import { parseUnsubscribeToken, tokenFromQuery } from "@/lib/newsletter";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function UnsubscribePage({ searchParams }: Props) {
  const query = await searchParams;
  const token = parseUnsubscribeToken(tokenFromQuery(query.token));

  return (
    <TokenPage
      kind="unsubscribe"
      token={token}
      title="Unsubscribe"
      intro="Press the button to stop receiving the Azhayon Media newsletter."
      problem="This unsubscribe link is not valid. Please use the link in the most recent email we sent you."
    />
  );
}