import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getLocale } from "@/lib/locale";
import { getProductText } from "@/lib/product-text";

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(5),
  customerAddress: z.string().min(5),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const locale = await getLocale();

  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { items, customerName, customerEmail, customerPhone, customerAddress } =
    parsed.data;
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
  });

  if (products.length !== items.length) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  for (const item of items) {
    const product = productMap.get(item.productId);
    const text = product ? getProductText(product, locale) : null;
    if (!product || product.quantity < item.quantity) {
      return NextResponse.json(
        { error: `Not enough stock for ${text?.name ?? "product"}.` },
        { status: 400 }
      );
    }
  }

  const total = items.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + Number(product?.price ?? 0) * item.quantity;
  }, 0);

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
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
}
