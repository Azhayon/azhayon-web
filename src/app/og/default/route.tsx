import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/lib/site";

const CACHE = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#121212",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 128, fontWeight: 700 }}>
          <span>Azhayon</span>
          <span style={{ color: "#ff3366", marginLeft: 28 }}>Media</span>
        </div>
        <div style={{ display: "flex", width: 160, height: 8, background: "#00e5ff", marginTop: 28 }} />
        <div style={{ display: "flex", fontSize: 36, color: "#a0a0ab", marginTop: 36 }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    { width: 1200, height: 630, headers: { "Cache-Control": CACHE } },
  );
}