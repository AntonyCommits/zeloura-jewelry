"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Grid, List } from 'lucide-react';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import LiveChatWidget from '@/components/LiveChatWidget';
import ProductFilters from '@/components/ProductFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { products, getFilteredProducts } from '@/data/products';
import { getReviewSummary } from '@/data/reviews';

interface FilterState {
  category?: string;
  priceRange?: [number, number];
  colors: string[];
  materials: string[];
  rating?: number;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
}

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();

  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const categoryName = category ? decodeURIComponent(category) : '';
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const [filters, setFilters] = useState<FilterState>({
    category: formattedCategory,
    colors: [],
    materials: [],
  });
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const filtered = getFilteredProducts(filters);
    setFilteredProducts(filtered);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      category: formattedCategory,
      colors: [],
      materials: [],
    });
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

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

  const categoryDescriptions: Record<string, string> = {
    rings: "Discover our exquisite collection of rings, from elegant engagement rings to statement pieces that express your unique style.",
    necklaces: "Explore our stunning necklace collection featuring delicate pendants, bold statement pieces, and timeless chains.",
    earrings: "Find the perfect earrings to complement any look, from subtle studs to dramatic drops and elegant hoops.",
    bracelets: "Adorn your wrists with our beautiful bracelet collection, featuring delicate chains, charm bracelets, and elegant bangles.",
    anklets: "Step into style with our delicate anklet collection, perfect for adding a touch of elegance to any outfit.",
    sets: "Complete your look with our coordinated jewelry sets, thoughtfully designed to create a harmonious and polished appearance.",
    personalised: "Make it uniquely yours with our personalized jewelry collection, featuring custom engravings and bespoke designs.",
    chains: "Discover our versatile chain collection, perfect for layering or wearing alone as a statement piece."
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-pink-600">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-800">{formattedCategory}</span>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{formattedCategory}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {categoryDescriptions[categoryName.toLowerCase()] ||
             `Explore our beautiful collection of ${formattedCategory.toLowerCase()} crafted with precision and care.`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6'
              }>
                {filteredProducts.map((product) => {
                  const variant = product.variants[0];
                  const isWishlisted = isInWishlist(product.id);
                  const reviewSummary = getReviewSummary(product.id);
                  const actualRating = reviewSummary.averageRating || product.rating;
                  const actualReviewCount = reviewSummary.totalReviews || product.reviewCount;
                  const discount = variant.originalPrice > variant.price
                    ? Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100)
                    : 0;

                  if (viewMode === 'list') {
                    return (
                      <Card
                        key={product.id}
                        className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="flex">
                          <div className="relative w-48 h-48 flex-shrink-0">
                            <img
                              src={variant.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                            {discount > 0 && (
                              <Badge className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs">
                                {discount}% OFF
                              </Badge>
                            )}
                          </div>

                          <CardContent className="flex-1 p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                <div className="flex items-center gap-2 mb-3">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm text-gray-600 ml-1">
                                      {actualRating} ({actualReviewCount} reviews)
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 mb-4">
                                  <span className="text-xl font-bold text-gray-800">
                                    ₹{variant.price.toLocaleString()}
                                  </span>
                                  {variant.originalPrice > variant.price && (
                                    <span className="text-lg text-gray-500 line-through">
                                      ₹{variant.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="ml-4">
                                <Button
                                  className="bg-pink-600 hover:bg-pink-700 text-white"
                                  onClick={(e) => handleAddToCart(product, e)}
                                >
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    );
                  }

                  // Grid view
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

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.isNew && (
                            <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                          )}
                          {product.isBestseller && (
                            <Badge className="bg-pink-100 text-pink-800 text-xs">Bestseller</Badge>
                          )}
                          {discount > 0 && (
                            <Badge className="bg-red-100 text-red-800 text-xs">{discount}% OFF</Badge>
                          )}
                        </div>
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
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any {formattedCategory.toLowerCase()} matching your criteria.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShoppingCart />
      <LiveChatWidget />
    </div>
  );
}
