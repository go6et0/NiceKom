import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function Footer() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-foreground/80">{t.footer.line1}</p>
        <p>{t.footer.line2}</p>
      </div>
    </footer>
  );
}
