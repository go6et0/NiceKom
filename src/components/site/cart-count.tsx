"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-context";
import { useLocale } from "@/components/site/locale-provider";

export default function CartCount() {
  const { items } = useCart();
  const { t } = useLocale();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link href="/cart" className="relative inline-flex items-center gap-2">
      <span>{t.nav.cart}</span>
      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
        {count}
      </span>
    </Link>
  );
}
