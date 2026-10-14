import { apiGet } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";

export default async function Home() {
  let health: HealthResponse | null = null;
  let error: string | null = null;

  try {
    health = await apiGet<HealthResponse>("/health", { cache: "no-store" });
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Azhayon Media: connection test</h1>
      {health ? (
        <pre>{JSON.stringify(health, null, 2)}</pre>
      ) : (
        <p style={{ color: "crimson" }}>API unreachable: {error}</p>
      )}
    </main>
  );
}