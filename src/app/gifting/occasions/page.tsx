"use client";

import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function GiftOccasionsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Gifting: Occasions</h1>
        <p className="text-gray-600 mb-8">Silver gifts tailored for every special moment.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push('/gifting/occasions/anniversary')}>Anniversary</Button>
          <Button variant="outline" onClick={() => router.push('/gifting/occasions/wedding')}>Wedding</Button>
          <Button variant="outline" onClick={() => router.push('/gifting/occasions/birthday')}>Birthday</Button>
          <Button variant="outline" onClick={() => router.push('/gifting/occasions/couples')}>Couples</Button>
        </div>
        <div className="mt-10">
          <Button className="px-8" onClick={() => router.push('/products')}>Shop All Products</Button>
        </div>
      </div>
    </div>
  );
}
