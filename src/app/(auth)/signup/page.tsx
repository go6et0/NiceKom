"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/site/locale-provider";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { t } = useLocale();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name")?.toString(),
        email: formData.get("email")?.toString(),
        password: formData.get("password")?.toString(),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || t.auth.signupError);
    } else {
      setMessage(t.auth.signupSuccess);
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
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? t.auth.creating : t.auth.createAccount}
        </Button>
      </form>
    </main>
  );
}
