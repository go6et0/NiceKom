import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

type OrdersPageProps = {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

const PAGE_SIZE = 8;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAuth();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const dateLocale = locale === "bg" ? "bg-BG" : "en-US";
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const rawPage = resolvedSearchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Math.max(1, Number(pageValue || "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, totalOrders, latestOrder] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { items: true },
    }),
    prisma.order.count({
      where: { userId: session.user.id },
    }),
    prisma.order.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const latestOrderDate = latestOrder?.createdAt;
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.orders.title}</h1>
        <p className="text-muted-foreground">{t.orders.subtitle}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.orders.totalOrders}</p>
          <p className="mt-2 text-2xl font-semibold">{totalOrders}</p>
        </article>
        <article className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">{t.orders.latestOrder}</p>
          <p className="mt-2 text-2xl font-semibold">
            {latestOrderDate
              ? new Date(latestOrderDate).toLocaleDateString(dateLocale)
              : "-"}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm">
        {orders.length === 0 ? (
          <p className="text-muted-foreground">{t.orders.noOrders}</p>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-border/60 bg-background/60 p-4"
              >
                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold">
                    {t.orders.orderId}: {order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-muted-foreground">
                    {t.orders.orderDate}:{" "}
                    {new Date(order.createdAt).toLocaleString(dateLocale)}
                  </p>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <span>
                    {t.orders.status}:{" "}
                    {t.order.status[order.status as keyof typeof t.order.status] ??
                      order.status}
                  </span>
                  <span>
                    {t.orders.items}: {order.items.length}
                  </span>
                  <span>
                    {t.orders.total}: {formatCurrency(Number(order.total))}
                  </span>
                </div>
                <div className="mt-3">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {t.orders.viewDetails}
                  </Link>
                </div>
                <div className="mt-3 rounded-lg border border-border/60 bg-card/80 p-3 text-sm">
                  <p className="font-medium">{t.orders.customerDetails}</p>
                  <p className="mt-1 text-muted-foreground">
                    {order.customerName} | {order.customerEmail} | {order.customerPhone}
                  </p>
                  <p className="text-muted-foreground">{order.customerAddress}</p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} | {item.quantity} x {formatCurrency(Number(item.price))}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
        {totalOrders > 0 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            {previousPage ? (
              <Link
                href={`/orders?page=${previousPage}`}
                className="rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-background/70"
              >
                {t.orders.previousPage}
              </Link>
            ) : (
              <span />
            )}
            <p className="text-sm text-muted-foreground">
              {t.orders.pageLabel} {page} / {totalPages}
            </p>
            {nextPage ? (
              <Link
                href={`/orders?page=${nextPage}`}
                className="rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-background/70"
              >
                {t.orders.nextPage}
              </Link>
            ) : (
              <span />
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}
