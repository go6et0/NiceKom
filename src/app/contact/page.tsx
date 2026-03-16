import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { siteContact } from "@/lib/site-contact";

export default async function ContactPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    siteContact.email
  )}`;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.contact.title}</h1>
        <p className="text-muted-foreground">
          {t.contact.intro}
        </p>
      </div>
      <section className="grid gap-6 rounded-3xl border border-border/60 bg-card/80 p-8 text-sm shadow-sm">
        <div>
          <p className="text-muted-foreground">{t.contact.email}</p>
          <a
            href={gmailComposeUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold transition hover:text-primary"
          >
            {siteContact.email}
          </a>
        </div>
        <div>
          <p className="text-muted-foreground">{t.contact.phone}</p>
          <a
            href={`tel:${siteContact.phoneHref}`}
            className="font-semibold transition hover:text-primary"
          >
            {siteContact.phoneLabel}
          </a>
        </div>
        <div>
          <p className="text-muted-foreground">{t.contact.address}</p>
          <p className="font-semibold">{siteContact.address}</p>
        </div>
      </section>
    </main>
  );
}
