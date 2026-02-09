"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/components/site/locale-provider";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailClient() {
  const params = useSearchParams();
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.success ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, [params]);

  const heading =
    status === "success"
      ? t.verify.verifiedTitle
      : status === "loading"
      ? t.verify.verifyingTitle
      : t.verify.failedTitle;

  const message =
    status === "success"
      ? t.verify.verifiedMessage
      : status === "loading"
      ? t.verify.loadingMessage
      : t.verify.failedMessage;

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
      <p className="text-muted-foreground">{message}</p>
      <Link
        href="/login"
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
      >
        {t.verify.goToLogin}
      </Link>
    </main>
  );
}
