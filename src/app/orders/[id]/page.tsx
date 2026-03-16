import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

type OrderDetailsPageProps = {
  params: Promise<{ id?: string }> | { id?: string };
};

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const session = await requireAuth();
  const locale = await getLocale();
  const t = getDictionary(locale);
  const dateLocale = locale === "bg" ? "bg-BG" : "en-US";
  const resolvedParams = await Promise.resolve(params);

  if (!resolvedParams?.id) notFound();

  const order = await prisma.order.findFirst({
    where: { id: resolvedParams.id, userId: session.user.id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">
          {t.orders.orderId}: {order.id.slice(-8).toUpperCase()}
        </h1>
        <p className="text-muted-foreground">
          {t.orders.orderDate}: {new Date(order.createdAt).toLocaleString(dateLocale)}
        </p>
      </div>

      <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{t.orders.status}</h2>
        <p className="mt-4 inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-foreground">
          {t.order.status[order.status as keyof typeof t.order.status] ?? order.status}
        </p>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{t.orders.items}</h2>
        <ul className="mt-4 space-y-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-border/50 bg-background/60 px-4 py-3"
            >
              <p className="text-base font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.quantity} x {formatCurrency(Number(item.price))}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-right text-lg font-semibold">
          {t.orders.total}: {formatCurrency(Number(order.total))}
        </p>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold">{t.orders.customerDetails}</h2>
        <div className="mt-3 grid gap-2 text-base">
          <p>
            <span className="text-muted-foreground">{t.cart.fullName}: </span>
            {order.customerName}
          </p>
          <p>
            <span className="text-muted-foreground">{t.cart.email}: </span>
            {order.customerEmail}
          </p>
          <p>
            <span className="text-muted-foreground">{t.cart.phone}: </span>
            {order.customerPhone}
          </p>
          <p>
            <span className="text-muted-foreground">{t.cart.address}: </span>
            {order.customerAddress}
          </p>
        </div>
      </section>
    </main>
  );
}
