import { notFound } from "next/navigation";
import {
  getCachedProductBySlug,
  getCachedProductSlugs,
} from "@/lib/data/catalog";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getCachedProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
