"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-context";
import { useLocale } from "@/components/site/locale-provider";

type AddToCartButtonProps = {
  productId: string;
  name: string;
  price: number;
  image?: string;
  maxQuantity: number;
};

export default function AddToCartButton({
  productId,
  name,
  price,
  image,
  maxQuantity,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { t } = useLocale();
  const [added, setAdded] = useState(false);
  const outOfStock = maxQuantity <= 0;

  return (
    <Button
      onClick={() => {
        addItem({
          productId,
          name,
          price,
          image,
          quantity: 1,
          maxQuantity,
        });
        setAdded(true);
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
