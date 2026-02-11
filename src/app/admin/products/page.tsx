import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/app/admin/products/actions";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";
import { getProductText } from "@/lib/product-text";

export default async function ProductsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{t.admin.products}</h2>
        <Button asChild>
          <Link href="/admin/products/new">{t.admin.addProduct}</Link>
        </Button>
      </div>
      {products.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t.admin.noProducts}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {products.map((product) => {
            const text = getProductText(product, locale);
            return (
              <div
                key={product.id}
                className="flex flex-col gap-3 border-b border-border/50 pb-4 text-sm last:border-none last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
              <div>
                <p className="font-semibold">{text.name}</p>
                <p className="text-muted-foreground">
                  {product.brand} | {t.product.type[product.type]} |{" "}
                  {product.quantity} {t.admin.inStock}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={`/admin/products/${product.id}`}>{t.admin.edit}</Link>
                </Button>
                <form
                  action={deleteProduct.bind(null, product.id)}
                  className="w-full sm:w-auto"
                >
                  <Button variant="destructive" type="submit" className="w-full sm:w-auto">
                    {t.admin.delete}
                  </Button>
                </form>
              </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
