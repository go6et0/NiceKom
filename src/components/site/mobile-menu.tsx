"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocale } from "@/components/site/locale-provider";
import { useTheme } from "@/components/site/theme-provider";
import { signOut } from "next-auth/react";
import { useCart } from "@/components/cart/cart-context";

type MobileMenuProps = {
  isAuthed: boolean;
  isAdmin: boolean;
};

export default function MobileMenu({ isAuthed, isAdmin }: MobileMenuProps) {
  const { t } = useLocale();
  const { theme, toggle } = useTheme();
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label={t.nav.menu}
          title={t.nav.menu}
        >
          <Menu />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="fixed left-auto right-0 top-0 h-full w-80 max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-l border-border/60 bg-background p-6 shadow-2xl"
        showCloseButton
      >
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {t.nav.menu}
        </div>
        <div className="mt-6 flex flex-col gap-4 text-sm">
          <div className="grid gap-2 rounded-2xl border border-border/60 bg-card/80 p-4 font-medium shadow-sm">
            <DialogClose asChild>
              <Link href="/">{t.nav.shop}</Link>
            </DialogClose>
            <DialogClose asChild>
              <Link href="/about">{t.nav.about}</Link>
            </DialogClose>
            <DialogClose asChild>
              <Link href="/contact">{t.nav.contact}</Link>
            </DialogClose>
            {isAdmin && (
              <DialogClose asChild>
                <Link href="/admin" className="text-primary">
                  {t.nav.adminPanel}
                </Link>
              </DialogClose>
            )}
          </div>
          {!isAuthed ? (
            <div className="grid gap-2">
              <DialogClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">{t.nav.signUp}</Link>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button asChild className="w-full">
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
              </DialogClose>
            </div>
          ) : (
            <div className="grid gap-2">
              <DialogClose asChild>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/cart" className="flex items-center justify-center gap-2">
                    <span>{t.nav.cart}</span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {count}
                    </span>
                  </Link>
                </Button>
              </DialogClose>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                {t.nav.logout}
              </Button>
            </div>
          )}
          <div className="grid gap-2 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
            <Button variant="ghost" className="w-full justify-between" onClick={toggle}>
              <span>
                {theme === "dark" ? t.nav.switchToLight : t.nav.switchToDark}
              </span>
              <span className="text-xs text-muted-foreground">
                {theme === "dark" ? "L" : "D"}
              </span>
            </Button>
            <LocaleToggleButton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LocaleToggleButton() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const next = locale === "en" ? "bg" : "en";

  return (
    <Button
      variant="ghost"
      className="w-full justify-between"
      onClick={() => {
        setLocale(next);
        router.refresh();
      }}
    >
      <span>{next === "bg" ? t.nav.switchToBg : t.nav.switchToEn}</span>
      <span className="text-xs text-muted-foreground">
        {next.toUpperCase()}
      </span>
    </Button>
  );
}
