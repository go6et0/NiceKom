import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.about.title}</h1>
        <p className="text-muted-foreground">
          {t.about.intro}
        </p>
      </div>
      <section className="grid gap-6 rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm">
        <h2 className="text-2xl font-semibold">{t.about.sectionTitle}</h2>
        <p className="text-muted-foreground">
          {t.about.sectionBody1}
        </p>
        <p className="text-muted-foreground">
          {t.about.sectionBody2}
        </p>
      </section>
    </main>
  );
}
