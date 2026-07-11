import { notFound } from "next/navigation";
import { getProductBySlug, allProducts } from "@/lib/data/products";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
