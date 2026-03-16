"use client";

import { signOut } from "next-auth/react";
import { useLocale } from "@/components/site/locale-provider";

export default function FooterLogoutLink() {
  const { t } = useLocale();

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-fit text-left text-muted-foreground transition hover:text-foreground"
    >
      {t.nav.logout}
    </button>
  );
}

