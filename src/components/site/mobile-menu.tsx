"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, ClipboardList, Languages, LogOut, Menu, ShoppingCart, SunMoon } from "lucide-react";
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
        className="fixed left-auto right-0 top-0 h-full w-80 max-w-[85vw] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-l border-border/60 bg-background p-5 shadow-2xl"
        showCloseButton
      >
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {t.nav.menu}
        </div>
        <div className="mt-5 flex flex-col gap-4 text-sm">
          <div className="grid gap-1 rounded-2xl border border-border/60 bg-card/80 p-3 font-medium shadow-sm">
            <DialogClose asChild>
              <Link
                href="/"
                className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-muted/40"
              >
                <span>{t.nav.shop}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            </DialogClose>
            <DialogClose asChild>
              <Link
                href="/about"
                className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-muted/40"
              >
                <span>{t.nav.about}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            </DialogClose>
            <DialogClose asChild>
              <Link
                href="/contact"
                className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-muted/40"
              >
                <span>{t.nav.contact}</span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Link>
            </DialogClose>
            {isAdmin && (
              <DialogClose asChild>
                <Link
                  href="/admin"
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-primary transition hover:bg-muted/40"
                >
                  <span>{t.nav.adminPanel}</span>
                  <ChevronRight size={16} />
                </Link>
              </DialogClose>
            )}
          </div>
          {!isAuthed ? (
            <div className="grid gap-2 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm">
              <DialogClose asChild>
                <Button asChild variant="ghost" className="h-10 w-full justify-between px-3">
                  <Link href="/signup">{t.nav.signUp}</Link>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button asChild className="h-10 w-full justify-between px-3">
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
              </DialogClose>
            </div>
          ) : (
            <div className="grid gap-2 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm">
              <DialogClose asChild>
                <Button asChild variant="ghost" className="h-10 w-full justify-between px-3">
                  <Link href="/orders" className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ClipboardList size={16} />
                      {t.nav.myOrders}
                    </span>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </Link>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button asChild variant="ghost" className="h-10 w-full justify-between px-3">
                  <Link href="/cart" className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShoppingCart size={16} />
                      {t.nav.cart}
                    </span>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      {count}
                    </span>
                  </Link>
                </Button>
              </DialogClose>
              <Button
                variant="ghost"
                className="h-10 w-full justify-between px-3"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <span className="flex items-center gap-2">
                  <LogOut size={16} />
                  {t.nav.logout}
                </span>
                <ChevronRight size={16} className="text-muted-foreground" />
              </Button>
            </div>
          )}
          <div className="grid gap-2 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-sm">
            <Button variant="ghost" className="h-10 w-full justify-between px-3" onClick={toggle}>
              <span className="flex items-center gap-2">
                <SunMoon size={16} />
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
      className="h-10 w-full justify-between px-3"
      onClick={() => {
        setLocale(next);
        router.refresh();
      }}
    >
      <span className="flex items-center gap-2">
        <Languages size={16} />
        {next === "bg" ? t.nav.switchToBg : t.nav.switchToEn}
      </span>
      <span className="text-xs text-muted-foreground">
        {next.toUpperCase()}
      </span>
    </Button>
  );
}
