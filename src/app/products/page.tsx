"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import ProductFilters from '@/components/ProductFilters';
import ShoppingCart from '@/components/ShoppingCart';
import LiveChatWidget from '@/components/LiveChatWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Heart, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { getReviewSummary } from '@/data/reviews';

interface FilterState {
  category?: string;
  priceRange?: [number, number];
  colors: string[];
  materials: string[];
  rating?: number;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();

  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    materials: [],
  });
  const { products } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
  }, [searchParams]);

  // Update filtered products when filters or source products change
  useEffect(() => {
    let list = [...products];

    if (filters.category) {
      list = list.filter(p => p.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.priceRange) {
      list = list.filter(p => {
        const price = p.variants[0]?.price ?? 0;
        return price >= filters.priceRange![0] && price <= filters.priceRange![1];
      });
    }

    if (filters.colors && filters.colors.length > 0) {
      list = list.filter(p => p.variants.some(v => filters.colors.includes(v.color.toLowerCase())));
    }

    if (filters.materials && filters.materials.length > 0) {
      list = list.filter(p => p.variants.some(v => filters.materials.some(m => v.material.toLowerCase().includes(m.toLowerCase()))));
    }

    if (filters.rating) {
      list = list.filter(p => p.rating >= filters.rating!);
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-low':
          list.sort((a, b) => (a.variants[0]?.price ?? 0) - (b.variants[0]?.price ?? 0));
          break;
        case 'price-high':
          list.sort((a, b) => (b.variants[0]?.price ?? 0) - (a.variants[0]?.price ?? 0));
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
      }
    }

    setFilteredProducts(list);
  }, [filters, products]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      colors: [],
      materials: [],
    });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as FilterState['sortBy']
    }));
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
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

    if (!isAuthenticated) {
      return;
    }

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const renderProductCard = (product: Product) => {
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

                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
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
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <button onClick={() => router.push('/')} className="hover:text-pink-600">
            Home
          </button>
          <span className="mx-2">/</span>
          <span className="text-gray-800">All Products</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
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
                {/* Mobile Filters */}
                <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <ProductFilters
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      className="border-0 shadow-none"
                    />
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-gray-600">
                  {filteredProducts.length} products found
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={filters.sortBy || 'newest'}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

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
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-6'
            }>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(renderProductCard)
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 mb-4">No products found matching your criteria.</p>
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredProducts.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" className="px-8">
                  Load More Products
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
