import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/product-form";
import { updateProduct } from "@/app/admin/products/actions";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/i18n";

type EditProductPageProps = {
  params: Promise<{ id?: string }> | { id?: string };
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  if (!resolvedParams?.id) notFound();

  const locale = await getLocale();
  const t = getDictionary(locale);

  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!product) notFound();
  const primaryVariant = product.variants[0];
  const additionalVariants = product.variants.slice(1);

  return (
    <div className="max-w-3xl">
      <ProductForm
        defaultValues={{
          name: product.name,
          brand: product.brand,
          shortDescription: product.shortDescription,
          shortDescriptionBg: product.shortDescriptionBg ?? undefined,
          description: product.description,
          descriptionBg: product.descriptionBg ?? undefined,
          advantages: product.advantages,
          advantagesBg: product.advantagesBg ?? undefined,
          type: product.type,
          viscosity: product.viscosity,
          unit: primaryVariant?.unit ?? product.unit,
          packageSize: Number(primaryVariant?.packageSize ?? product.packageSize),
          application: product.application,
          applicationBg: product.applicationBg ?? undefined,
          certification: product.certification,
          baseOil: product.baseOil,
          operatingTempMin: product.operatingTempMin,
          operatingTempMax: product.operatingTempMax,
          price: Number(primaryVariant?.price ?? product.price),
          quantity: primaryVariant?.quantity ?? product.quantity,
          additionalVariants: additionalVariants.map((variant) => ({
            packageSize: Number(variant.packageSize),
            unit: variant.unit,
            price: Number(variant.price),
            quantity: variant.quantity,
          })),
          images: product.images,
        }}
        action={updateProduct.bind(null, product.id)}
        submitLabel={t.admin.updateProduct}
        successMessage={t.admin.productUpdated}
        errorMessage={t.admin.productSaveError}
      />
    </div>
  );
}
