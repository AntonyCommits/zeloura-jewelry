import { Suspense } from 'react';
import ProductsPageClient from '@/components/ProductsPageClient';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import LiveChatWidget from '@/components/LiveChatWidget';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
