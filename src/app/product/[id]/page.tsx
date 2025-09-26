import ProductDetailClient from './ProductDetailClient';

export default function Page({ params }: { params: { id: string } }) {
  return <ProductDetailClient id={params.id} />;
}

// Next.js static export requires this to exist for dynamic routes
export function generateStaticParams(): { id: string }[] {
  return [];
}

