"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/site/locale-provider";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";

    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) {
        setMessage({ type: "error", text: t.auth.forgotError });
      } else {
        setMessage({ type: "success", text: t.auth.forgotSuccess });
        (event.target as HTMLFormElement).reset();
      }
    } catch {
      setMessage({ type: "error", text: t.auth.forgotError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.auth.forgotTitle}</h1>
        <p className="text-muted-foreground">{t.auth.forgotSubtitle}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm"
      >
        <Input name="email" type="email" placeholder={t.auth.emailPlaceholder} required />
        {message ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
              message.type === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                : "border-destructive/40 bg-destructive/10 text-destructive"
            }`}
          >
            {message.text}
          </div>
        ) : null}
        <Button type="submit" disabled={loading}>
          {loading ? t.auth.sendingReset : t.auth.sendResetLink}
        </Button>
      </form>
    </main>
  );
}
