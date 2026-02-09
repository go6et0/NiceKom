"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/cart/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { useLocale } from "@/components/site/locale-provider";

export default function CartPage() {
  const { items, subtotal, removeItem, updateQuantity, clear } = useCart();
  const { data: session } = useSession();
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    if (session?.user?.email && !customerEmail) {
      setCustomerEmail(session.user.email);
    }
  }, [session?.user?.email, customerEmail]);

  const handleCheckout = async () => {
    setLoading(true);
    setMessage(null);
    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim() ||
      !customerAddress.trim()
    ) {
      setMessage(t.cart.missingDetails);
      setLoading(false);
      return;
    }
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || t.cart.orderError);
    } else {
      setMessage(t.cart.orderSuccess);
      clear();
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="text-3xl font-semibold">{t.cart.title}</h1>
        <p className="text-muted-foreground">
          {t.cart.subtitle}
        </p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-10 text-center text-muted-foreground">
          {t.cart.empty}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{t.cart.customerDetails}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder={t.cart.fullName}
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
              />
              <Input
                type="email"
                placeholder={t.cart.email}
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                required
              />
              <Input
                placeholder={t.cart.phone}
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                required
              />
              <Textarea
                placeholder={t.cart.address}
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                rows={3}
                required
              />
            </div>
          </div>
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-24 overflow-hidden rounded-xl border border-border/60 bg-background/70">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)} {t.cart.each}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Input
                    type="number"
                    min={1}
                    max={item.maxQuantity}
                    value={item.quantity}
                    className="w-24"
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (!Number.isNaN(next)) {
                        updateQuantity(item.productId, next);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => removeItem(item.productId)}
                  >
                    {t.cart.remove}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-muted-foreground">{t.cart.subtotal}</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(subtotal)}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              {!session?.user && (
                <p className="text-sm text-muted-foreground">
                  {t.cart.loginToOrder}
                </p>
              )}
              <Button
                onClick={handleCheckout}
                disabled={loading || !session?.user}
              >
                {loading ? t.cart.placingOrder : t.cart.placeOrder}
              </Button>
              {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
