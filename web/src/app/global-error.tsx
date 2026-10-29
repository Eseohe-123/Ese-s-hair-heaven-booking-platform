"use client";

// Last line of defence: catches crashes in the root layout itself.
// Global styles are unavailable here, so everything is inline.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff7f0",
          color: "#3e2a2e",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 26, color: "#6b2148", margin: 0 }}>
            Hairven had a hiccup
          </h1>
          <p style={{ marginTop: 12, lineHeight: 1.5 }}>
            Something went wrong while opening the app. Tap below to load it again —
            your requests and bookings are safe.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 20,
              border: 0,
              borderRadius: 999,
              padding: "12px 28px",
              background: "#f472a0",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Reload Hairven
          </button>
          {error.digest && (
            <p style={{ marginTop: 18, fontSize: 12, color: "#9a7684" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
