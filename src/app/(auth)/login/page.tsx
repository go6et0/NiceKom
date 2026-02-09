import { Suspense } from "react";
import LoginForm from "./login-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function LoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-12">
          <div>
            <h1 className="text-3xl font-semibold">{t.auth.loginTitle}</h1>
            <p className="text-muted-foreground">{t.auth.loginLoading}</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
