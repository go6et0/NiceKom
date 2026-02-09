"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendOrderStatusEmail } from "@/lib/mailer";

const statusSchema = z.enum(["PENDING", "ACCEPTED", "COMPLETED"]);

export async function updateOrderStatus(orderId: string, formData: FormData) {
  const status = statusSchema.safeParse(formData.get("status"));
  if (!status.success) {
    throw new Error("Invalid status.");
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: status.data },
    select: {
      customerEmail: true,
      customerName: true,
      status: true,
    },
  });

  if (order.customerEmail) {
    try {
      await sendOrderStatusEmail(
        order.customerEmail,
        order.customerName,
        order.status
      );
    } catch (error) {
      console.error("Failed to send order status email", error);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function deleteOrder(orderId: string) {
  await prisma.orderItem.deleteMany({ where: { orderId } });
  await prisma.order.delete({ where: { id: orderId } });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
