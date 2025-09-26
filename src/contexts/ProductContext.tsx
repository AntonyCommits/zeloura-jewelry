"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ServerTimestamp } from '@/data/products';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  FieldValue,
  DocumentData,
  WithFieldValue,
} from 'firebase/firestore';

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  searchProducts: (query: string) => Product[];
  isLoading: boolean;
  error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime Firestore subscription
  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, {
      next: (snapshot) => {
        const list: Product[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Convert Firestore Timestamp to Date if needed
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
          const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt;
          
          list.push({
            id: doc.id,
            ...data,
            createdAt,
            updatedAt,
          } as Product);
        });
        
        setProducts(list);
        setIsLoading(false);
      },
      error: (err) => {
        console.error('Firestore products subscription error:', err);
        setError('Failed to load products');
        setIsLoading(false);
      },
    });
    return () => unsub();
  }, []);

  // Legacy no-op kept in case callers reference it
  const loadProducts = () => {};

  // Legacy no-op; Firestore is source of truth now
  const saveProducts = (_productsToSave: Product[]) => {};

  // Convert Product data to Firestore-compatible format
  const prepareForFirestore = (data: Partial<Product>): WithFieldValue<DocumentData> => {
    const result: Record<string, unknown> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) return; // Skip undefined values
      
      if (Array.isArray(value)) {
        // Handle arrays (like variants, images, etc.)
        result[key] = value.map(item => 
          typeof item === 'object' && item !== null ? prepareForFirestore(item as any) : item
        );
      } else if (value instanceof Date) {
        // Convert Date to Firestore Timestamp
        result[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        result[key] = prepareForFirestore(value as any);
      } else {
        // Primitive values
        result[key] = value;
      }
    });
    
    return result;
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      console.log('[Products] addProduct -> attempting write', productData);
      
      // Create a new product with server timestamps
      const newProduct: Omit<Product, 'id'> & { createdAt: ServerTimestamp; updatedAt: ServerTimestamp } = {
        ...productData,
        rating: productData.rating ?? 0,
        reviewCount: productData.reviewCount ?? 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const payload = prepareForFirestore(newProduct);
      const ref = await addDoc(collection(db, 'products'), payload);
      console.log('[Products] addProduct -> created doc', ref.id);
      return ref.id;
    } catch (err) {
      setError('Failed to add product');
      console.error('[Products] Error adding product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
    try {
      console.log('[Products] updateProduct ->', id, productData);
      const ref = doc(db, 'products', id);
      const snap = await getDoc(ref);
      
      // Create update data with server timestamp
      const updateData: Partial<Product> & { updatedAt: ServerTimestamp } = {
        ...productData,
        updatedAt: serverTimestamp(),
      };
      
      const payload = prepareForFirestore(updateData);
      
      if (snap.exists()) {
        await updateDoc(ref, payload);
        return true;
      }
      
      // If the document does not exist (e.g., migrated from local), create a new one
      await addDoc(collection(db, 'products'), {
        ...payload,
        id,
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (err) {
      setError('Failed to update product');
      console.error('[Products] Error updating product:', err);
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      console.log('[Products] deleteProduct ->', id);
      await deleteDoc(doc(db, 'products', id));
      return true;
    } catch (err) {
      setError('Failed to delete product');
      return false;
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product =>
      product.category.toLowerCase() === category.toLowerCase()
    );
  };

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const value: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductsByCategory,
    searchProducts,
    isLoading,
    error,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
