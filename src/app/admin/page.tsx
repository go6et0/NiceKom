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

  const [totalOrders, pendingOrders, acceptedOrders, completedOrders, lowStockCount, revenue] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "ACCEPTED" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.product.count({ where: { quantity: { lte: 5 } } }),
      prisma.order.aggregate({ _sum: { total: true } }),
    ]);

  const totalRevenue = Number(revenue._sum.total ?? 0);

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.admin.totalProducts}</p>
          <p className="mt-2 text-3xl font-semibold">{products}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {lowStockCount} {t.admin.inStock} {"<="} 5
          </p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.admin.orders}</p>
          <p className="mt-2 text-3xl font-semibold">{totalOrders}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            P: {pendingOrders} | A: {acceptedOrders} | C: {completedOrders}
          </p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.orders.total}</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalRevenue)}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t.orders.totalSpent}</p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.admin.addProduct}</p>
          <Button asChild className="mt-4 w-full">
            <Link href="/admin/products/new">{t.admin.addProduct}</Link>
          </Button>
        </article>
      </section>

      <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">{t.admin.latestOrders}</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.admin.noOrders}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="space-y-1">
                  <p className="text-base font-semibold">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {t.orders.orderDate}: {new Date(order.createdAt).toLocaleDateString(dateLocale)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.orders.items}: {order.items.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t.orders.status}:{" "}
                    {t.order.status[order.status as keyof typeof t.order.status] ?? order.status}
                  </p>
                  <p className="pt-1 text-base font-semibold">
                    {formatCurrency(Number(order.total))}
                  </p>
                </div>
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

