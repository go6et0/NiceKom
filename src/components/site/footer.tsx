import Link from "next/link";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import { auth } from "@/auth";
import FooterLogoutLink from "@/components/site/footer-logout-link";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { siteContact } from "@/lib/site-contact";

export default async function Footer() {
  const session = await auth();
  const isAuthed = Boolean(session?.user);
  const locale = await getLocale();
  const t = getDictionary(locale);
  const currentYear = new Date().getFullYear();
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    siteContact.email
  )}`;

  return (
    <footer className="border-t border-border/60 bg-gradient-to-b from-background to-background/95 py-12">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 md:grid-cols-3">
        <section className="space-y-3">
          <p className="text-xl font-semibold text-foreground">{t.footer.line1}</p>
          <p className="max-w-sm text-sm text-muted-foreground">{t.footer.line2}</p>
          <p className="text-xs text-muted-foreground">{t.footer.legalNote}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
            {t.footer.contactsTitle}
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a
              href={`tel:${siteContact.phoneHref}`}
              className="flex items-center gap-2 transition hover:text-foreground"
            >
              <Phone size={16} />
              {siteContact.phoneLabel}
            </a>
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 transition hover:text-foreground"
            >
              <Mail size={16} />
              {siteContact.email}
            </a>
            <p className="flex items-center gap-2">
              <MapPin size={16} />
              {t.footer.addressValue}
            </p>
            <p className="flex items-center gap-2">
              <Clock3 size={16} />
              <span>
                {t.footer.workingHoursLabel}: {t.footer.workingHoursValue}
              </span>
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
            {t.footer.quickLinksTitle}
          </h2>
          <nav className="grid gap-2 text-sm">
            <Link href="/" className="text-muted-foreground transition hover:text-foreground">
              {t.nav.shop}
            </Link>
            <Link href="/about" className="text-muted-foreground transition hover:text-foreground">
              {t.nav.about}
            </Link>
            <Link href="/contact" className="text-muted-foreground transition hover:text-foreground">
              {t.nav.contact}
            </Link>
            {!isAuthed ? (
              <>
                <Link href="/signup" className="text-muted-foreground transition hover:text-foreground">
                  {t.nav.signUp}
                </Link>
                <Link href="/login" className="text-muted-foreground transition hover:text-foreground">
                  {t.nav.login}
                </Link>
              </>
            ) : (
              <>
                <Link href="/orders" className="text-muted-foreground transition hover:text-foreground">
                  {t.nav.myOrders}
                </Link>
                <FooterLogoutLink />
              </>
            )}
          </nav>
        </section>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-7xl flex-col gap-2 border-t border-border/60 px-6 pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          (c) {currentYear} NiceKom Oils. {t.footer.rights}
        </p>
        <p>{t.footer.legalCompany}</p>
      </div>
    </footer>
  );
}
