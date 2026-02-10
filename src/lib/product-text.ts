import { type Product } from "@prisma/client";
import { type Locale } from "@/lib/i18n";

type ProductText = {
  name: string;
  shortDescription: string;
  description: string;
  advantages: string[];
  application?: string | null;
  certification?: string | null;
};

export function getProductText(
  product: Product,
  locale: Locale
): ProductText {
  if (locale !== "bg") {
    return {
      name: product.name,
      shortDescription: product.shortDescription,
      description: product.description,
      advantages: product.advantages,
      application: product.application,
      certification: product.certification,
    };
  }

  return {
    name: product.name,
    shortDescription: product.shortDescriptionBg || product.shortDescription,
    description: product.descriptionBg || product.description,
    advantages:
      product.advantagesBg.length > 0 ? product.advantagesBg : product.advantages,
    application: product.applicationBg || product.application,
    certification: product.certificationBg || product.certification,
  };
}
