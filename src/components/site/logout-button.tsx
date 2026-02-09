"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/site/locale-provider";

export default function LogoutButton() {
  const { t } = useLocale();
  return (
    <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
      {t.nav.logout}
    </Button>
  );
}
