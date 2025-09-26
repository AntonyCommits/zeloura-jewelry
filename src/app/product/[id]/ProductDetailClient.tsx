"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Heart, Truck, RotateCcw, Shield, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductImageGallery from '@/components/ProductImageGallery';
import ReviewSummary from '@/components/ReviewSummary';
import ReviewDisplay from '@/components/ReviewDisplay';
import ReviewForm from '@/components/ReviewForm';
import { Product, ProductVariant } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { getReviewSummary } from '@/data/reviews';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();
  const { products } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'care' | 'reviews'>('details');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    const found = products.find(p => p.id === id) || null;
    if (found) {
      const summary = getReviewSummary(id);
      const updated: Product = {
        ...found,
        rating: summary.averageRating || found.rating,
        reviewCount: summary.totalReviews || found.reviewCount,
      };
      setProduct(updated);
      const defVar = found.variants.find(v => v.id === found.defaultVariant) || found.variants[0];
      setSelectedVariant(defVar || null);
      if (found.sizes && found.sizes.length > 0) setSelectedSize(found.sizes[0]);
    } else {
      setProduct(null);
      setSelectedVariant(null);
    }
  }, [id, reviewKey, products]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-gray-600 mb-4">The item you are looking for may have been removed.</p>
        <Button variant="outline" onClick={() => router.push('/products')}>Back to Products</Button>
      </div>
    );
  }
  if (!selectedVariant) return null;

  const isInWish = isInWishlist(product.id);
  const currentPrice = selectedVariant.price;
  const originalPrice = selectedVariant.originalPrice;
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedVariant.id}-${selectedSize}`,
      name: product.name,
      price: currentPrice,
      originalPrice: originalPrice,
      image: selectedVariant.images[0].url,
      quantity: quantity,
      size: selectedSize,
      color: selectedVariant.color,
    });
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) return;
    if (isInWish) removeFromWishlist(product.id); else addToWishlist(product.id);
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      alert('Please log in to write a review');
      return;
    }
    setIsReviewFormOpen(true);
  };

  const handleReviewSubmitted = () => {
    setReviewKey(prev => prev + 1);
    setActiveTab('reviews');
  };

  const renderStars = (rating: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-6">
        <button onClick={() => router.push('/')} className="hover:text-pink-600">Home</button>
        <span className="mx-2">/</span>
        <button onClick={() => router.push(`/category/${product.category.toLowerCase()}`)} className="hover:text-pink-600">
          {product.category}
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <ProductImageGallery images={selectedVariant.images} productName={product.name} />
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.isNew && <Badge className="bg-green-100 text-green-800">New</Badge>}
              {product.isBestseller && <Badge className="bg-pink-100 text-pink-800">Bestseller</Badge>}
              {discount > 0 && <Badge className="bg-red-100 text-red-800">{discount}% OFF</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
                <span className="text-sm text-gray-600 ml-1">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
              <button onClick={() => setActiveTab('reviews')} className="text-sm text-pink-600 hover:text-pink-700 font-medium">
                Read Reviews
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
              {originalPrice > currentPrice && (
                <span className="text-lg text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="text-sm text-gray-600">Inclusive of all taxes</p>
          </div>

          {/* Color Selection */}
          {product.variants.length > 1 && (
            <div>
              <h3 className="font-medium mb-3">Color: {selectedVariant.color}</h3>
              <div className="flex gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`w-12 h-12 rounded-full border-2 overflow-hidden ${
                      selectedVariant.id === variant.id ? 'border-pink-600' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedVariant(variant)}
                  >
                    <img src={variant.images[0].url} alt={variant.color} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 border rounded-md text-sm ${
                      selectedSize === size ? 'border-pink-600 bg-pink-50 text-pink-600' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div>
            <h3 className="font-medium mb-3">Quantity</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <button className="p-2 hover:bg-gray-50" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button className="p-2 hover:bg-gray-50" onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))} disabled={quantity >= selectedVariant.stock}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3" onClick={handleAddToCart} disabled={selectedVariant.stock === 0 || (!selectedSize && (product.sizes?.length ?? 0) > 0)}>
              Add to Cart - ₹{(currentPrice * quantity).toLocaleString()}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="py-3" onClick={handleWishlistToggle}>
                <Heart className={`h-4 w-4 mr-2 ${isInWish ? 'fill-red-500 text-red-500' : ''}`} />
                {isInWish ? 'Saved' : 'Save'}
              </Button>
              <Button variant="outline" className="py-3" onClick={handleWriteReview}>
                <Star className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-pink-600" />
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-gray-600">{product.shipping.days} days</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-6 w-6 mx-auto mb-2 text-pink-600" />
              <p className="text-sm font-medium">Easy Returns</p>
              <p className="text-xs text-gray-600">{product.returns.days} days</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-pink-600" />
              <p className="text-sm font-medium">Warranty</p>
              <p className="text-xs text-gray-600">1 year</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <div className="border-b">
          <nav className="flex space-x-8">
            {[
              { id: 'details', label: 'Details' },
              { id: 'specifications', label: 'Specifications' },
              { id: 'care', label: 'Care Instructions' },
              { id: 'reviews', label: 'Reviews' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id as 'details' | 'specifications' | 'care' | 'reviews')}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Features</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Product Specifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Care Instructions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {product.care.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ReviewSummary key={`summary-${reviewKey}`} productId={product.id} onWriteReview={handleWriteReview} />
              </div>
              <div className="lg:col-span-2">
                <ReviewDisplay key={`display-${reviewKey}`} productId={product.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Form Modal */}
      <ReviewForm
        productId={product.id}
        productName={product.name}
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
