import type { Metadata } from "next";
import { TokenPage } from "@/components/newsletter/TokenPage";
import { parseConfirmToken, tokenFromQuery } from "@/lib/newsletter";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Confirm your subscription",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ConfirmPage({ searchParams }: Props) {
  const query = await searchParams;
  const token = parseConfirmToken(tokenFromQuery(query.token));

  return (
    <TokenPage
      kind="confirm"
      token={token}
      title="Confirm your subscription"
      intro="Press the button to finish signing up for the Azhayon Media newsletter."
      problem="This confirmation link is invalid or incomplete. Please sign up again from the footer of any page."
    />
  );
}