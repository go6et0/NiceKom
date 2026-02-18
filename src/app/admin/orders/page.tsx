import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { updateOrderStatus, deleteOrder } from "@/app/admin/orders/actions";
import DeleteOrderButton from "@/components/admin/delete-order-button";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import Link from "next/link";

type OrdersPageProps = {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

const PAGE_SIZE = 12;

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const dateLocale = locale === "bg" ? "bg-BG" : "en-US";
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const rawPage = resolvedSearchParams.page;
  const pageValue = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const page = Math.max(1, Number(pageValue || "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, user: true },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.order.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalOrders / PAGE_SIZE));
  const previousPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const statusLabel = (status: string) =>
    t.order.status[status as keyof typeof t.order.status] ?? status;

  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
      <h2 className="text-xl font-semibold">{t.admin.orders}</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t.admin.noOrders}</p>
      ) : (
        <div className="mt-4 space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border-b border-border/50 pb-4">
              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-muted-foreground">
                    {order.customerEmail} | {order.customerPhone}
                  </p>
                  <p className="text-muted-foreground">
                    {order.customerAddress}
                  </p>
                  <p className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString(dateLocale)}
                  </p>
                </div>
                <p className="text-base font-semibold">
                  {formatCurrency(Number(order.total))}
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center">
                <span className="font-semibold">
                  {t.admin.status}: {statusLabel(order.status)}
                </span>
                <form
                  action={updateOrderStatus.bind(null, order.id)}
                  className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
                >
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm sm:min-w-40"
                  >
                    <option value="PENDING">{t.order.status.PENDING}</option>
                    <option value="ACCEPTED">{t.order.status.ACCEPTED}</option>
                    <option value="COMPLETED">{t.order.status.COMPLETED}</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground sm:ml-2"
                  >
                    {t.admin.save}
                  </button>
                </form>
                <DeleteOrderButton action={deleteOrder.bind(null, order.id)} />
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} | {item.quantity} x{" "}
                    {formatCurrency(Number(item.price))}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {orders.length > 0 ? (
        <div className="mt-6 flex items-center justify-between gap-3">
          {previousPage ? (
            <Link
              href={`/admin/orders?page=${previousPage}`}
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
              href={`/admin/orders?page=${nextPage}`}
              className="rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-background/70"
            >
              {t.orders.nextPage}
            </Link>
          ) : (
            <span />
          )}
        </div>
      ) : null}
    </div>
  );
}
