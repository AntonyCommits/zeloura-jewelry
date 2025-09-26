"use client";

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function GiftForHimPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Gifting: For Him</h1>
        <p className="text-gray-600 mb-8">Find timeless silver pieces perfect for him.</p>
        <Button className="px-8" onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    </div>
  );
}
