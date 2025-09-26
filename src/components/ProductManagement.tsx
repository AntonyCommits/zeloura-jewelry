"use client";

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Package,
  TrendingUp,
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useProducts } from '@/contexts/ProductContext';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/data/products';
import ProductForm from './ProductForm';

interface ProductManagementProps {
  className?: string;
}

export default function ProductManagement({ className = '' }: ProductManagementProps) {
  const { admin, hasPermission } = useAdmin();
  const { user } = useAuth();
  const { products, deleteProduct, searchProducts, isLoading } = useProducts();
  const [activeTab, setActiveTab] = useState<'all' | 'low-stock' | 'bestsellers' | 'new'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const categories = ['all', 'Earrings', 'Necklaces', 'Bracelets', 'Rings'];

  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = searchProducts(searchTerm);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Apply tab filters
    switch (activeTab) {
      case 'low-stock':
        filtered = filtered.filter(p => 
          p.variants.some(v => v.stock < 10)
        );
        break;
      case 'bestsellers':
        filtered = filtered.filter(p => p.isBestseller);
        break;
      case 'new':
        filtered = filtered.filter(p => p.isNew);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, filterCategory, activeTab, searchProducts]);

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const success = deleteProduct(productToDelete.id);
      if (success) {
        setShowDeleteDialog(false);
        setProductToDelete(null);
        alert('Product deleted successfully!');
      } else {
        alert('Failed to delete product');
      }
    }
  };

  const getStockStatus = (product: Product) => {
    const minStock = Math.min(...product.variants.map(v => v.stock));
    if (minStock === 0) return { status: 'out', color: 'bg-red-100 text-red-800', icon: XCircle };
    if (minStock < 10) return { status: 'low', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    return { status: 'good', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const getTotalValue = () => {
    return products.reduce((total, product) => {
      return total + product.variants.reduce((variantTotal, variant) => {
        return variantTotal + (variant.price * variant.stock);
      }, 0);
    }, 0);
  };

  const getLowStockCount = () => {
    return products.filter(p => p.variants.some(v => v.stock < 10)).length;
  };

  const getBestsellerCount = () => {
    return products.filter(p => p.isBestseller).length;
  };

  const isAuthAdmin = !!user?.isAdmin;
  const canRead = isAuthAdmin || (admin && hasPermission('products', 'read'));
  if (!canRead) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access product management.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your jewelry inventory and products</p>
        </div>
        {(isAuthAdmin || hasPermission('products', 'write')) && (
          <Button
            onClick={() => setShowProductForm(true)}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bestsellers</p>
                <p className="text-2xl font-bold text-gray-900">{getBestsellerCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{getLowStockCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{getTotalValue().toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'all', label: 'All Products', count: products.length },
            { id: 'low-stock', label: 'Low Stock', count: getLowStockCount() },
            { id: 'bestsellers', label: 'Bestsellers', count: getBestsellerCount() },
            { id: 'new', label: 'New Products', count: products.filter(p => p.isNew).length }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-800">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} products
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">No products match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              const mainVariant = product.variants.find(v => v.id === product.defaultVariant) || product.variants[0];
              
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Product Image */}
                    <div className="relative mb-4">
                      <img
                        src={mainVariant.images[0]?.url || '/placeholder-jewelry.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        {product.isNew && (
                          <Badge className="bg-green-100 text-green-800">New</Badge>
                        )}
                        {product.isBestseller && (
                          <Badge className="bg-pink-100 text-pink-800">Bestseller</Badge>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₹{mainVariant.price.toLocaleString()}</p>
                          {mainVariant.originalPrice > mainVariant.price && (
                            <p className="text-sm text-gray-500 line-through">
                              ₹{mainVariant.originalPrice.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between">
                        <Badge className={stockStatus.color}>
                          <stockStatus.icon className="h-3 w-3 mr-1" />
                          {stockStatus.status === 'out' ? 'Out of Stock' : 
                           stockStatus.status === 'low' ? 'Low Stock' : 'In Stock'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Stock: {Math.min(...product.variants.map(v => v.stock))}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProduct(product)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {(isAuthAdmin || hasPermission('products', 'write')) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowProductForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Product Images */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {selectedProduct.variants[0]?.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>

                {/* Product Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedProduct.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                    
                    <div className="space-y-2">
                      <p><strong>Category:</strong> {selectedProduct.category}</p>
                      <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                      <p><strong>Rating:</strong> {selectedProduct.rating}/5 ({selectedProduct.reviewCount} reviews)</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Variants</h4>
                    <div className="space-y-2">
                      {selectedProduct.variants.map((variant) => (
                        <div key={variant.id} className="border rounded p-2">
                          <p><strong>{variant.color} - {variant.material}</strong></p>
                          <p>Price: ₹{variant.price.toLocaleString()}</p>
                          <p>Stock: {variant.stock}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-2">Features</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedProduct.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600">{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Form Modal */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onClose={() => {
              setShowProductForm(false);
              setSelectedProduct(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmDelete}
              >
                Delete Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
