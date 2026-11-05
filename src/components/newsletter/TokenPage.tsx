import { TokenAction } from "@/components/newsletter/TokenAction";

type Props = {
  kind: "confirm" | "unsubscribe";
  /** Already format-checked, or null when the link was missing or malformed. */
  token: string | null;
  title: string;
  intro: string;
  problem: string;
};

export function TokenPage({ kind, token, title, intro, problem }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
      <p className="mt-3 text-muted">{token ? intro : problem}</p>
      {token && <TokenAction kind={kind} token={token} />}
    </main>
  );
}