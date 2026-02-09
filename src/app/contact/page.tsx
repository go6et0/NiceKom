import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function ContactPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

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
          <p className="font-semibold">sales@nicekom.com</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t.contact.phone}</p>
          <p className="font-semibold">+1 (312) 555-0142</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t.contact.address}</p>
          <p className="font-semibold">
            418 Industrial Avenue, Chicago, IL 60607
          </p>
        </div>
      </section>
    </main>
  );
}
