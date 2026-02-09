import { createProduct } from "@/app/admin/products/actions";
import ProductForm from "@/components/admin/product-form";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

export default async function NewProductPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="max-w-3xl">
      <ProductForm action={createProduct} submitLabel={t.admin.createProduct} />
    </div>
  );
}
