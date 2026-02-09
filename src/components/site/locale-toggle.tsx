"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/site/locale-provider";
import { type Locale } from "@/lib/i18n";

export default function LocaleToggle() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const nextLocale: Locale = locale === "en" ? "bg" : "en";
  const label = nextLocale === "bg" ? t.nav.switchToBg : t.nav.switchToEn;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        setLocale(nextLocale);
        router.refresh();
      }}
      aria-label={label}
      title={label}
    >
      <span className="text-xs font-semibold uppercase">
        {nextLocale.toUpperCase()}
      </span>
    </Button>
  );
}
