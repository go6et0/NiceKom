import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function AdminPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const dateLocale = locale === "bg" ? "bg-BG" : "en-US";

  const [products, orders] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: true, user: true },
    }),
  ]);

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t.admin.totalProducts}</p>
            <p className="text-3xl font-semibold">{products}</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">{t.admin.addProduct}</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{t.admin.latestOrders}</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.admin.noOrders}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 border-b border-border/50 pb-4 text-sm last:border-none last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-muted-foreground">
                    {order.items.length} {t.admin.items} |{" "}
                    {t.order.status[order.status as keyof typeof t.order.status] ??
                      order.status}{" "}
                    | {new Date(order.createdAt).toLocaleDateString(dateLocale)}
                  </p>
                </div>
                <p className="text-base font-semibold">
                  {formatCurrency(Number(order.total))}
                </p>
              </div>
            ))}
          </div>
        )}
        <Button asChild variant="outline" className="mt-6">
          <Link href="/admin/orders">{t.admin.viewAllOrders}</Link>
        </Button>
      </div>
    </div>
  );
}
