import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function VerifyEmailPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            {t.verify.verifyingTitle}
          </h1>
          <p className="text-muted-foreground">
            {t.verify.verifyingMessage}
          </p>
        </main>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
