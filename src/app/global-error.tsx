"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          background: "#121212",
          color: "#e0e0e0",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <main role="alert">
          <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#a0a0ab" }}>The site could not be loaded. Please try again in a moment.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: "1rem", padding: "0.6rem 1.2rem", border: 0, borderRadius: 6, background: "#ff3366", color: "#121212", fontWeight: 700, cursor: "pointer" }}
          >
            Try again
          </button>
          {error.digest && <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#a0a0ab" }}>Reference: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}