"use client";

import { useState, useEffect } from 'react';
import { Product, ProductVariant, ProductImage } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: 'Zeloura',
    variants: [] as Omit<ProductVariant, 'id'>[],
    features: [] as string[],
    specifications: {} as Record<string, string>,
    care: [] as string[],
    shipping: { free: true, days: 3, cost: 0 },
    returns: { allowed: true, days: 30 },
    tags: [] as string[],
    isNew: false,
    isBestseller: false,
    discount: 0
  });

  const [newFeature, setNewFeature] = useState('');
  const [newCare, setNewCare] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const categories = ['Earrings', 'Necklaces', 'Bracelets', 'Rings', 'Watches', 'Accessories'];
  const subcategories = {
    'Earrings': ['Drop Earrings', 'Stud Earrings', 'Hoops', 'Chandelier', 'Ear Cuffs'],
    'Necklaces': ['Pendant Necklaces', 'Chains', 'Chokers', 'Layered', 'Statement'],
    'Bracelets': ['Chain Bracelets', 'Charm Bracelets', 'Bangles', 'Cuffs', 'Anklets'],
    'Rings': ['Statement Rings', 'Stackable', 'Engagement', 'Wedding Bands', 'Cocktail'],
    'Watches': ['Analog', 'Digital', 'Smart', 'Luxury', 'Sports'],
    'Accessories': ['Brooches', 'Hair Accessories', 'Belts', 'Scarves', 'Bags']
  };

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        brand: product.brand,
        variants: product.variants.map(v => ({
          color: v.color,
          material: v.material,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          images: v.images
        })),
        features: [...product.features],
        specifications: { ...product.specifications },
        care: [...product.care],
        shipping: { ...product.shipping },
        returns: { ...product.returns },
        tags: [...product.tags],
        isNew: product.isNew || false,
        isBestseller: product.isBestseller || false,
        discount: product.discount || 0
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.subcategory) newErrors.subcategory = 'Subcategory is required';
    if (formData.variants.length === 0) newErrors.variants = 'At least one variant is required';

    formData.variants.forEach((variant, index) => {
      if (!variant.color.trim()) newErrors[`variant_${index}_color`] = 'Color is required';
      if (!variant.material.trim()) newErrors[`variant_${index}_material`] = 'Material is required';
      if (variant.price <= 0) newErrors[`variant_${index}_price`] = 'Price must be greater than 0';
      if (variant.stock < 0) newErrors[`variant_${index}_stock`] = 'Stock cannot be negative';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const productData = {
        ...formData,
        variants: formData.variants.map((variant, index) => ({
          ...variant,
          id: product?.variants[index]?.id || `${Date.now()}-${index}`
        })),
        defaultVariant: (product?.variants[0]?.id) || `${Date.now()}-0`,
        rating: product?.rating ?? 0,
        reviewCount: product?.reviewCount ?? 0,
      };

      if (product) {
        const success = updateProduct(product.id, productData);
        if (success) {
          alert('Product updated successfully!');
          onClose();
        } else {
          alert('Failed to update product');
        }
      } else {
        const newId = await addProduct(productData);
        if (newId) {
          alert('Product added successfully!');
          onClose();
        } else {
          alert('Failed to add product');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('An error occurred while saving the product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, {
        color: '',
        material: '',
        price: 0,
        originalPrice: 0,
        stock: 0,
        images: [{ url: '', alt: '', type: 'main' as const }]
      }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: keyof Omit<ProductVariant, 'id'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addCare = () => {
    if (newCare.trim()) {
      setFormData(prev => ({
        ...prev,
        care: [...prev.care, newCare.trim()]
      }));
      setNewCare('');
    }
  };

  const removeCare = (index: number) => {
    setFormData(prev => ({
      ...prev,
      care: prev.care.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter brand name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: e.target.value,
                    subcategory: '' // Reset subcategory when category changes
                  }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory *
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.subcategory ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.category}
              >
                <option value="">Select subcategory</option>
                {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {errors.subcategory && <p className="text-red-500 text-sm mt-1">{errors.subcategory}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isNew}
                onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                className="mr-2"
              />
              New Product
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isBestseller}
                onChange={(e) => setFormData(prev => ({ ...prev, isBestseller: e.target.checked }))}
                className="mr-2"
              />
              Bestseller
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Product Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.variants && <p className="text-red-500 text-sm">{errors.variants}</p>}
          
          {formData.variants.map((variant, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Variant {index + 1}</h4>
                {formData.variants.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color *
                  </label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      errors[`variant_${index}_color`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Gold, Silver"
                  />
                  {errors[`variant_${index}_color`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`variant_${index}_color`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material *
                  </label>
                  <input
                    type="text"
                    value={variant.material}
                    onChange={(e) => updateVariant(index, 'material', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      errors[`variant_${index}_material`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 18K Gold, Sterling Silver"
                  />
                  {errors[`variant_${index}_material`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`variant_${index}_material`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      errors[`variant_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors[`variant_${index}_price`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`variant_${index}_price`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    value={variant.originalPrice}
                    onChange={(e) => updateVariant(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                      errors[`variant_${index}_stock`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                    min="0"
                  />
                  {errors[`variant_${index}_stock`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`variant_${index}_stock`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={variant.images[0]?.url || ''}
                      onChange={(e) => updateVariant(index, 'images', [{ 
                        url: e.target.value, 
                        alt: `${formData.name} - ${variant.color}`, 
                        type: 'main' as const 
                      }])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="text-xs text-gray-500">
                      💡 Tip: Use high-quality images (at least 800x800px) for best results
                    </div>
                    {variant.images[0]?.url && (
                      <div className="mt-2">
                        <img
                          src={variant.images[0].url}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addVariant}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Add a feature"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <Badge key={index} className="flex items-center gap-1">
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Care Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Care Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCare}
              onChange={(e) => setNewCare(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Add care instruction"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCare())}
            />
            <Button type="button" onClick={addCare}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <ul className="list-disc list-inside space-y-1">
            {formData.care.map((care, index) => (
              <li key={index} className="flex items-center justify-between">
                <span>{care}</span>
                <button
                  type="button"
                  onClick={() => removeCare(index)}
                  className="ml-2 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Specification name"
            />
            <input
              type="text"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Specification value"
            />
            <Button type="button" onClick={addSpecification} className="md:col-span-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </div>

          <div className="space-y-2">
            {Object.entries(formData.specifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span><strong>{key}:</strong> {value}</span>
                <button
                  type="button"
                  onClick={() => removeSpecification(key)}
                  className="hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping & Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping & Returns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Days
              </label>
              <input
                type="number"
                value={formData.shipping.days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  shipping: { ...prev.shipping, days: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Days
              </label>
              <input
                type="number"
                value={formData.returns.days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  returns: { ...prev.returns, days: parseInt(e.target.value) || 0 }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.shipping.free}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  shipping: { ...prev.shipping, free: e.target.checked }
                }))}
                className="mr-2"
              />
              Free Shipping
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.returns.allowed}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  returns: { ...prev.returns, allowed: e.target.checked }
                }))}
                className="mr-2"
              />
              Returns Allowed
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {product ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {product ? 'Update Product' : 'Add Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
