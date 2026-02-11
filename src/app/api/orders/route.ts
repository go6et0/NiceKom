import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getLocale } from "@/lib/locale";
import { getProductText } from "@/lib/product-text";

const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  customerPhone: z.string().trim().min(5).max(40),
  customerAddress: z.string().trim().min(5).max(500),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive().max(999),
      })
    )
    .min(1)
    .max(100),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const locale = await getLocale();

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const { customerName, customerEmail, customerPhone, customerAddress } =
    parsed.data;
  const items = Array.from(
    parsed.data.items.reduce((acc, item) => {
      const current = acc.get(item.productId) ?? 0;
      acc.set(item.productId, current + item.quantity);
      return acc;
    }, new Map<string, number>())
  ).map(([productId, quantity]) => ({ productId, quantity }));

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
  });

  if (products.length !== items.length) {
    return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  try {
    const total = items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + Number(product?.price ?? 0) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, quantity: { gte: item.quantity } },
          data: { quantity: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          const product = productMap.get(item.productId);
          const name = product ? getProductText(product, locale).name : "";
          throw new Error(`INSUFFICIENT_STOCK:${name}`);
        }
      }

      return tx.order.create({
        data: {
          userId: session.user.id,
          total,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          items: {
            create: items.map((item) => {
              const product = productMap.get(item.productId)!;
              const text = getProductText(product, locale);
              return {
                productId: product.id,
                name: text.name,
                price: product.price,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK")) {
      const [, productName] = error.message.split(":");
      return NextResponse.json(
        { error: "INSUFFICIENT_STOCK", productName: productName || undefined },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "ORDER_FAILED" }, { status: 500 });
  }
}
