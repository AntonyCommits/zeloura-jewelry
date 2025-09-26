"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, Heart, Star, Crown, Calendar, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import LiveChatWidget from '@/components/LiveChatWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { getReviewSummary } from '@/data/reviews';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function GiftStorePage() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();
  const [selectedOccasion, setSelectedOccasion] = useState('all');

  const occasions = [
    { id: 'all', name: 'All Gifts', icon: Gift },
    { id: 'anniversary', name: 'Anniversary', icon: Heart },
    { id: 'birthday', name: 'Birthday', icon: Star },
    { id: 'wedding', name: 'Wedding', icon: Crown },
    { id: 'valentine', name: "Valentine's Day", icon: Heart },
    { id: 'mothers-day', name: "Mother's Day", icon: Heart },
  ];

  const priceRanges = [
    {
      title: "Under ₹1,000",
      subtitle: "Perfect starter gifts",
      image: "https://ext.same-assets.com/1353514568/gift-under-1000.jpg",
      link: "/products?price=0-1000"
    },
    {
      title: "₹1,000 - ₹3,000",
      subtitle: "Thoughtful presents",
      image: "https://ext.same-assets.com/1353514568/gift-1000-3000.jpg",
      link: "/products?price=1000-3000"
    },
    {
      title: "₹3,000 - ₹5,000",
      subtitle: "Special occasions",
      image: "https://ext.same-assets.com/1353514568/gift-3000-5000.jpg",
      link: "/products?price=3000-5000"
    },
    {
      title: "Premium Gifts",
      subtitle: "Luxury collection",
      image: "https://ext.same-assets.com/1353514568/gift-premium.jpg",
      link: "/products?price=5000-10000"
    }
  ];

  const giftGuides = [
    {
      title: "For Her",
      description: "Elegant pieces that celebrate her unique style",
      image: "https://ext.same-assets.com/1353514568/3727029561.jpeg",
      link: "/category/necklaces"
    },
    {
      title: "For Him",
      description: "Sophisticated jewelry for the modern man",
      image: "https://ext.same-assets.com/1353514568/1058676541.jpeg",
      link: "/category/chains"
    },
    {
      title: "For Couples",
      description: "Matching sets to celebrate your love",
      image: "https://ext.same-assets.com/1353514568/couples-gift.jpg",
      link: "/category/sets"
    },
    {
      title: "For Family",
      description: "Meaningful pieces for every family member",
      image: "https://ext.same-assets.com/1353514568/family-gift.jpg",
      link: "/products"
    }
  ];

  const bestSellerGifts = products.filter(p => p.isBestseller).slice(0, 6);

  const handleAddToCart = (product: typeof products[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const variant = product.variants[0];
    addToCart({
      id: `${product.id}-${variant.id}`,
      name: product.name,
      price: variant.price,
      originalPrice: variant.originalPrice,
      image: variant.images[0].url,
      color: variant.color,
    });
  };

  const handleWishlistToggle = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <button onClick={() => router.push('/')} className="hover:text-pink-600">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-800">Gift Store</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-800 px-4 py-2 rounded-full mb-4">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-medium">Perfect Gifts for Every Occasion</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Gift Store</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect jewelry gift for your loved ones. From elegant necklaces to stunning rings,
            we have something special for every celebration.
          </p>
        </div>

        {/* Occasion Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {occasions.map((occasion) => (
            <Button
              key={occasion.id}
              variant={selectedOccasion === occasion.id ? "default" : "outline"}
              className={`flex items-center gap-2 ${
                selectedOccasion === occasion.id
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "hover:bg-pink-50"
              }`}
              onClick={() => setSelectedOccasion(occasion.id)}
            >
              <occasion.icon className="h-4 w-4" />
              {occasion.name}
            </Button>
          ))}
        </div>

        {/* Gift by Price Range */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Budget</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {priceRanges.map((range, index) => (
              <Card
                key={index}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(range.link)}
              >
                <div className="relative h-48">
                  <img
                    src={range.image}
                    alt={range.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg">{range.title}</h3>
                    <p className="text-sm opacity-90">{range.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Gift Guides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Gift Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {giftGuides.map((guide, index) => (
              <Card
                key={index}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(guide.link)}
              >
                <div className="relative h-48">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Shop Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Best Seller Gifts */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Best Seller Gifts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {bestSellerGifts.map((product) => {
              const variant = product.variants[0];
              const isWishlisted = isInWishlist(product.id);
              const reviewSummary = getReviewSummary(product.id);
              const actualRating = reviewSummary.averageRating || product.rating;
              const actualReviewCount = reviewSummary.totalReviews || product.reviewCount;

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative">
                    <img
                      src={variant.images[0].url}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={(e) => handleWishlistToggle(product.id, e)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                      />
                    </button>
                    <Badge className="absolute top-2 left-2 bg-pink-100 text-pink-800 text-xs">
                      Perfect Gift
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">
                          {actualRating} | {actualReviewCount}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-gray-800">
                        ₹{variant.price.toLocaleString()}
                      </span>
                      {variant.originalPrice > variant.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{variant.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full bg-pink-100 text-pink-700 hover:bg-pink-200 border-0"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
              className="px-8"
            >
              View All Gifts
            </Button>
          </div>
        </div>

        {/* Gift Services */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Gift Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Free Gift Wrapping</h3>
              <p className="text-gray-600 text-sm">
                Every gift comes beautifully wrapped with our signature packaging and a personalized note card.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Scheduled Delivery</h3>
              <p className="text-gray-600 text-sm">
                Schedule your gift delivery for the perfect moment. We'll ensure it arrives exactly when you want it to.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Engraving</h3>
              <p className="text-gray-600 text-sm">
                Make it truly special with custom engraving. Add names, dates, or messages to create a unique keepsake.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Can't Decide?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our jewelry experts are here to help you find the perfect gift. Get personalized recommendations
            based on your budget, occasion, and recipient's style.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="bg-pink-600 hover:bg-pink-700"
              onClick={() => router.push('/contact')}
            >
              Get Gift Consultation
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/products')}
            >
              Browse All Products
            </Button>
          </div>
        </div>
      </div>

      <ShoppingCart />
      <LiveChatWidget />
    </div>
  );
}
