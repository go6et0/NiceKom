import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { updateOrderStatus, deleteOrder } from "@/app/admin/orders/actions";
import DeleteOrderButton from "@/components/admin/delete-order-button";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function OrdersPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const dateLocale = locale === "bg" ? "bg-BG" : "en-US";

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true },
  });

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
    </div>
  );
}
