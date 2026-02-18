"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/cart/cart-context";
import { ThemeProvider } from "@/components/site/theme-provider";
import { LocaleProvider } from "@/components/site/locale-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { type Locale } from "@/lib/i18n";

export default function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <SessionProvider>
      <CartProvider>
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
            <ToastProvider>{children}</ToastProvider>
          </LocaleProvider>
        </ThemeProvider>
      </CartProvider>
    </SessionProvider>
  );
}
