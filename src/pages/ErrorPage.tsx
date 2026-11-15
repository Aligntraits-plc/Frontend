import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { useEffect } from "react";

/*
  Shown when a page fails. It never shows the technical message to a student:
  that goes to the browser console for whoever is fixing it.
*/
export default function ErrorPage() {
  const error = useRouteError();
  const missing = isRouteErrorResponse(error) && error.status === 404;
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const home = path.startsWith("/admin")
    ? "/admin"
    : path.startsWith("/school-portal")
      ? "/school-portal"
      : path.startsWith("/dashboard")
        ? "/dashboard"
        : "/";

  useEffect(() => {
    console.error("AlignTraits page error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px",
        background: "#F4F6FA",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#0E1B2C",
      }}
    >
      <div
        role="alert"
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          border: "1px solid #DCE3EC",
          borderRadius: 20,
          padding: "32px 28px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>
          {missing ? "We could not find that page" : "Something went wrong on this page"}
        </h1>
        <p style={{ margin: "12px 0 24px", color: "#52637A", fontSize: 15.5, lineHeight: 1.6 }}>
          {missing
            ? "The link may be old. Your account and results are safe."
            : "Your account and results are safe. Try again, or go back and carry on from there."}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ background: "#004085", color: "#fff", border: 0, borderRadius: 12, padding: "12px 20px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
          >
            Try again
          </button>
          <a
            href={home}
            style={{ background: "#fff", color: "#004085", border: "1.5px solid #004085", borderRadius: 12, padding: "10.5px 20px", fontWeight: 700, fontSize: 15, textDecoration: "none" }}
          >
            {home === "/" ? "Go to the home page" : "Back to my dashboard"}
          </a>
        </div>
        <p style={{ margin: "22px 0 0", color: "#52637A", fontSize: 13.5 }}>
          Still stuck? Use Help on WhatsApp and tell us what you were doing.
        </p>
      </div>
    </main>
  );
}
