"use client";

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function GiftingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Gifting</h1>
        <p className="text-gray-600 mb-8">Thoughtful silver gifts for everyone and every occasion.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/gifting/him')}>Gift For Him</Button>
          <Button variant="outline" onClick={() => router.push('/gifting/her')}>Gift For Her</Button>
          <Button variant="outline" onClick={() => router.push('/gifting/kids')}>Gift For Kids</Button>
          <Button variant="outline" onClick={() => router.push('/gifting/occasions')}>Gift For Occasions</Button>
        </div>
        <div className="mt-10">
          <Button className="px-8" onClick={() => router.push('/products')}>Shop All Products</Button>
        </div>
      </div>
    </div>
  );
}
