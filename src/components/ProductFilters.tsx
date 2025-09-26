"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FilterState {
  category?: string;
  priceRange?: [number, number];
  colors: string[];
  materials: string[];
  rating?: number;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  className?: string;
}

const PRICE_RANGES = [
  { label: 'Under ₹1,000', min: 0, max: 1000 },
  { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
  { label: '₹2,000 - ₹3,000', min: 2000, max: 3000 },
  { label: '₹3,000 - ₹5,000', min: 3000, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: 100000 },
];

const COLORS = [
  { name: 'Silver', value: 'silver', color: '#C0C0C0' },
];

const MATERIALS = [
  '925 Sterling Silver',
];

const CATEGORIES = [
  'All',
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Anklets',
  'Sets',
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    color: true,
    material: false,
    rating: false,
  });

  const [customPriceRange, setCustomPriceRange] = useState({ min: '', max: '' });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'All' ? undefined : category
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max]
    });
  };

  const handleCustomPriceRange = () => {
    const min = parseInt(customPriceRange.min) || 0;
    const max = parseInt(customPriceRange.max) || 100000;
    if (min < max) {
      handlePriceRangeChange(min, max);
    }
  };

  const handleColorToggle = (color: string) => {
    const colors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];

    onFiltersChange({
      ...filters,
      colors
    });
  };

  const handleMaterialToggle = (material: string) => {
    const materials = filters.materials.includes(material)
      ? filters.materials.filter(m => m !== material)
      : [...filters.materials, material];

    onFiltersChange({
      ...filters,
      materials
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? undefined : rating
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priceRange) count++;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.materials.length > 0) count += filters.materials.length;
    if (filters.rating) count++;
    return count;
  };

  const renderStars = (rating: number, interactive = false, selected = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < rating
                ? selected
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-300 text-gray-300'
                : 'text-gray-200'
            } ${interactive ? 'cursor-pointer' : ''}`}
          />
        ))}
        {interactive && <span className="text-sm text-gray-600 ml-1">& up</span>}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold">Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-pink-600 hover:text-pink-700"
            >
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Category Filter */}
          <div>
            <button
              className="flex items-center justify-between w-full py-2 font-medium"
              onClick={() => toggleSection('category')}
            >
              <span>Category</span>
              {expandedSections.category ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.category && (
              <div className="mt-3 space-y-2">
                {CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={
                        (category === 'All' && !filters.category) ||
                        filters.category === category
                      }
                      onChange={() => handleCategoryChange(category)}
                      className="mr-2"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div>
            <button
              className="flex items-center justify-between w-full py-2 font-medium"
              onClick={() => toggleSection('price')}
            >
              <span>Price Range</span>
              {expandedSections.price ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.price && (
              <div className="mt-3 space-y-3">
                {PRICE_RANGES.map((range, index) => (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={
                        filters.priceRange?.[0] === range.min &&
                        filters.priceRange?.[1] === range.max
                      }
                      onChange={() => handlePriceRangeChange(range.min, range.max)}
                      className="mr-2"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                ))}

                {/* Custom Price Range */}
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Custom Range</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-20 p-2 border rounded text-sm"
                      value={customPriceRange.min}
                      onChange={(e) => setCustomPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <span className="text-sm">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-20 p-2 border rounded text-sm"
                      value={customPriceRange.max}
                      onChange={(e) => setCustomPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                    <Button size="sm" onClick={handleCustomPriceRange}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div>
            <button
              className="flex items-center justify-between w-full py-2 font-medium"
              onClick={() => toggleSection('color')}
            >
              <span>Color</span>
              {expandedSections.color ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.color && (
              <div className="mt-3 space-y-2">
                {COLORS.map((color) => (
                  <label key={color.value} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(color.value)}
                      onChange={() => handleColorToggle(color.value)}
                      className="mr-2"
                    />
                    <div
                      className="w-4 h-4 rounded-full border mr-2"
                      style={{ backgroundColor: color.color }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Material Filter */}
          <div>
            <button
              className="flex items-center justify-between w-full py-2 font-medium"
              onClick={() => toggleSection('material')}
            >
              <span>Material</span>
              {expandedSections.material ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.material && (
              <div className="mt-3 space-y-2">
                {MATERIALS.map((material) => (
                  <label key={material} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.materials.includes(material)}
                      onChange={() => handleMaterialToggle(material)}
                      className="mr-2"
                    />
                    <span className="text-sm">{material}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating Filter */}
          <div>
            <button
              className="flex items-center justify-between w-full py-2 font-medium"
              onClick={() => toggleSection('rating')}
            >
              <span>Customer Rating</span>
              {expandedSections.rating ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.rating && (
              <div className="mt-3 space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => handleRatingChange(rating)}
                      className="mr-2"
                    />
                    {renderStars(rating, true, filters.rating === rating)}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.category}
                  <button
                    onClick={() => handleCategoryChange('All')}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.priceRange && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                  <button
                    onClick={() => onFiltersChange({ ...filters, priceRange: undefined })}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}

              {filters.colors.map((color) => (
                <Badge key={color} variant="secondary" className="flex items-center gap-1">
                  {COLORS.find(c => c.value === color)?.name}
                  <button
                    onClick={() => handleColorToggle(color)}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {filters.materials.map((material) => (
                <Badge key={material} variant="secondary" className="flex items-center gap-1">
                  {material}
                  <button
                    onClick={() => handleMaterialToggle(material)}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}

              {filters.rating && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.rating}+ stars
                  <button
                    onClick={() => handleRatingChange(filters.rating!)}
                    className="ml-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
