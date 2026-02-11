"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/site/locale-provider";

export default function LoginForm() {
  const params = useSearchParams();
  const error = params.get("error");
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      callbackUrl: "/",
    });
    setLoading(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.auth.loginTitle}</h1>
        <p className="text-muted-foreground">
          {t.auth.loginSubtitle}
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm"
      >
        <Input
          name="email"
          type="email"
          placeholder={t.auth.emailPlaceholder}
          required
        />
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t.auth.passwordPlaceholder}
            className="pr-11"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <p className="text-sm text-destructive">
            {t.auth.invalidCredentials}
          </p>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? t.auth.signingIn : t.auth.loginButton}
        </Button>
      </form>
    </main>
  );
}
