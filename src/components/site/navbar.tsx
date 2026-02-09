import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import CartCount from "@/components/site/cart-count";
import LogoutButton from "@/components/site/logout-button";
import ThemeToggle from "@/components/site/theme-toggle";
import LocaleToggle from "@/components/site/locale-toggle";
import MobileMenu from "@/components/site/mobile-menu";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function Navbar() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const isAdmin = session?.user.role === "ADMIN";
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-[0.08em]">
          NiceKom Oils
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <div className="hidden flex-wrap items-center gap-3 rounded-full border border-border/60 bg-card/80 px-4 py-2 font-medium shadow-sm lg:flex">
            <Link href="/">{t.nav.shop}</Link>
            <Link href="/about">{t.nav.about}</Link>
            <Link href="/contact">{t.nav.contact}</Link>
            {isAdmin && (
              <Link href="/admin" className="text-primary">
                {t.nav.adminPanel}
              </Link>
            )}
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            <LocaleToggle />
            {!isAuthed && (
              <>
                <Button asChild variant="ghost">
                  <Link href="/signup">{t.nav.signUp}</Link>
                </Button>
                <Button asChild>
                  <Link href="/login">{t.nav.login}</Link>
                </Button>
              </>
            )}
            {isAuthed && (
              <>
                <CartCount />
                <LogoutButton />
              </>
            )}
          </div>
          <div className="flex items-center lg:hidden">
            <MobileMenu isAuthed={isAuthed} isAdmin={isAdmin} />
          </div>
        </nav>
      </div>
    </header>
  );
}
