import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{t.admin.title}</h1>
          <p className="text-muted-foreground">{t.admin.subtitle}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-3 rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm font-medium shadow-sm">
          <Link href="/admin">{t.admin.overview}</Link>
          <Link href="/admin/products">{t.admin.products}</Link>
          <Link href="/admin/orders">{t.admin.orders}</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
