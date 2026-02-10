"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/site/locale-provider";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { t } = useLocale();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: t.auth.passwordMismatch });
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 12000);

    let response: Response;
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name")?.toString(),
          email: formData.get("email")?.toString(),
          password,
          confirmPassword,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        setMessage({ type: "error", text: t.auth.requestTimeout });
      } else {
        setMessage({ type: "error", text: t.auth.signupError });
      }
      setLoading(false);
      window.clearTimeout(timeoutId);
      return;
    }
    window.clearTimeout(timeoutId);

    if (!response.ok) {
      const data = await response.json();
      const errorCode = data.error as string | undefined;
      const errorText =
        errorCode === "EMAIL_SEND_FAILED"
          ? t.auth.signupEmailError
          : errorCode === "EMAIL_EXISTS"
          ? t.auth.signupExists
          : data.error || t.auth.signupError;
      setMessage({ type: "error", text: errorText });
    } else {
      setMessage({ type: "success", text: t.auth.signupSuccess });
      (event.target as HTMLFormElement).reset();
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.auth.signupTitle}</h1>
        <p className="text-muted-foreground">
          {t.auth.signupSubtitle}
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm"
      >
        <Input name="name" placeholder={t.auth.namePlaceholder} />
        <Input
          name="email"
          type="email"
          placeholder={t.auth.emailPlaceholder}
          required
        />
        <Input
          name="password"
          type="password"
          placeholder={t.auth.passwordPlaceholder}
          required
        />
        <Input
          name="confirmPassword"
          type="password"
          placeholder={t.auth.confirmPasswordPlaceholder}
          required
        />
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
          {loading ? t.auth.creating : t.auth.createAccount}
        </Button>
      </form>
    </main>
  );
}
