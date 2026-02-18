"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("GlobalError", error);
    fetch("/api/client-errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "global-error",
        message: error.message,
        digest: error.digest,
      }),
    }).catch(() => undefined);
  }, [error]);

  return (
    <html>
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 px-6 py-10 text-center">
          <h2 className="text-2xl font-semibold">Application error</h2>
          <p>Unexpected error occurred. Please reload the page.</p>
        </main>
      </body>
    </html>
  );
}
