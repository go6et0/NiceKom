"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/site/locale-provider";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const params = useSearchParams();
  const token = useMemo(() => params.get("token") ?? "", [params]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!token) {
      setMessage({ type: "error", text: t.auth.resetInvalidToken });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorCode = data.error as string | undefined;
        const errorText =
          errorCode === "PASSWORD_POLICY"
            ? t.auth.passwordRequirements
            : errorCode === "PASSWORD_MISMATCH"
            ? t.auth.passwordMismatch
            : errorCode === "INVALID_TOKEN"
            ? t.auth.resetInvalidToken
            : t.auth.resetError;
        setMessage({ type: "error", text: errorText });
      } else {
        setMessage({ type: "success", text: t.auth.resetSuccess });
        (event.target as HTMLFormElement).reset();
      }
    } catch {
      setMessage({ type: "error", text: t.auth.resetError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.auth.resetTitle}</h1>
        <p className="text-muted-foreground">{t.auth.resetSubtitle}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm"
      >
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={t.auth.passwordPlaceholder}
            className="pr-11"
            minLength={8}
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
        <div className="relative">
          <Input
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t.auth.confirmPasswordPlaceholder}
            className="pr-11"
            minLength={8}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            title={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{t.auth.passwordRequirements}</p>
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
        <Button type="submit" disabled={loading || !token}>
          {loading ? t.auth.resetting : t.auth.resetButton}
        </Button>
        <Button asChild type="button" variant="ghost">
          <Link href="/login">{t.verify.goToLogin}</Link>
        </Button>
      </form>
    </main>
  );
}
