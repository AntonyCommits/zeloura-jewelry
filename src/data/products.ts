import { FieldValue } from 'firebase/firestore';

export type ServerTimestamp = FieldValue;

export interface ProductImage {
  url: string;
  alt: string;
  type: 'main' | 'hover' | 'detail' | '360';
}

export interface ProductVariant {
  id: string;
  color: string;
  material: string;
  images: ProductImage[];
  price: number;
  originalPrice: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  createdAt?: Date | ServerTimestamp;
  updatedAt?: Date | ServerTimestamp;
  category: string;
  subcategory: string;
  brand: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  defaultVariant: string;
  sizes?: string[];
  features: string[];
  specifications: Record<string, string>;
  care: string[];
  shipping: {
    free: boolean;
    days: number;
    cost?: number;
  };
  returns: {
    allowed: boolean;
    days: number;
  };
  tags: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  discount?: number;
}

export const products: Product[] = [];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product =>
    product.category.toLowerCase() === category.toLowerCase()
  );
};

export const getFilteredProducts = (filters: {
  category?: string;
  priceRange?: [number, number];
  color?: string;
  material?: string;
  rating?: number;
  sortBy?: 'price-low' | 'price-high' | 'rating' | 'newest';
}): Product[] => {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter(p =>
      p.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters.priceRange) {
    filtered = filtered.filter(p => {
      const price = p.variants[0].price;
      return price >= filters.priceRange![0] && price <= filters.priceRange![1];
    });
  }

  if (filters.color) {
    filtered = filtered.filter(p =>
      p.variants.some(v => v.color.toLowerCase() === filters.color!.toLowerCase())
    );
  }

  if (filters.material) {
    filtered = filtered.filter(p =>
      p.variants.some(v => v.material.toLowerCase().includes(filters.material!.toLowerCase()))
    );
  }

  if (filters.rating) {
    filtered = filtered.filter(p => p.rating >= filters.rating!);
  }

  // Sort products
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.variants[0].price - b.variants[0].price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.variants[0].price - a.variants[0].price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
  }

  return filtered;
};
