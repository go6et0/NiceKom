"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useLocale } from "@/components/site/locale-provider";
import { useToast } from "@/components/ui/toast-provider";

type AddToCartButtonProps = {
  productId: string;
  variantId?: string;
  variantLabel?: string;
  name: string;
  price: number;
  image?: string;
  maxQuantity: number;
};

export default function AddToCartButton({
  productId,
  variantId,
  variantLabel,
  name,
  price,
  image,
  maxQuantity,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const { showToast } = useToast();
  const [added, setAdded] = useState(false);
  const outOfStock = maxQuantity <= 0;

  return (
    <Button
      onClick={() => {
        addItem({
          lineId: variantId ?? productId,
          productId,
          variantId,
          variantLabel,
          name,
          price,
          image,
          quantity: 1,
          maxQuantity,
        });
        setAdded(true);
        showToast(t.product.added, "success");
        setTimeout(() => setAdded(false), 1200);
      }}
      disabled={outOfStock}
    >
      {outOfStock
        ? t.product.outOfStock
        : added
        ? t.product.added
        : t.product.addToCart}
    </Button>
  );
}
