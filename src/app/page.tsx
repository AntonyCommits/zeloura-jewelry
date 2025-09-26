"use client";

import Header from "@/components/Header";
import ShoppingCart from "@/components/ShoppingCart";
import LiveChatWidget from "@/components/LiveChatWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { products } from "@/data/products";
import { getReviewSummary } from "@/data/reviews";

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, isAuthenticated } = useAuth();

  const categories = [
    { name: "Rings", image: "https://ext.same-assets.com/1353514568/1883406996.jpeg" },
    { name: "Necklaces", image: "https://ext.same-assets.com/1353514568/1728652093.jpeg" },
    { name: "Earrings", image: "https://ext.same-assets.com/1353514568/1253975985.png" },
    { name: "Bracelets", image: "https://ext.same-assets.com/1353514568/3310719059.png" },
    { name: "Anklets", image: "https://ext.same-assets.com/1353514568/687778154.jpeg" },
    { name: "Sets", image: "https://ext.same-assets.com/1353514568/1203965347.jpeg" },
    { name: "Personalised", image: "https://ext.same-assets.com/1353514568/3325908122.png" },
    { name: "Chains", image: "https://ext.same-assets.com/1353514568/3574686172.jpeg" }
  ];

  const priceRanges: { label: string; price: string; color: string; link: string; subtitle?: string }[] = [
    { label: "Under", price: "₹999", color: "bg-pink-100", link: "/products?price=0-999" },
    { label: "Under", price: "₹2999", color: "bg-pink-100", link: "/products?price=1000-2999" },
    { label: "Under", price: "₹4999", color: "bg-pink-100", link: "/products?price=3000-4999" },
    // Removed Premium Gifts card linking to gift store
  ];

  const colors = [
    { name: "Silver", image: "https://ext.same-assets.com/1353514568/3670780191.jpeg", link: "/products?color=silver" },
  ];

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (product: typeof products[0], e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to product page

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
    e.stopPropagation(); // Prevent navigation to product page

    if (!isAuthenticated) {
      // Could trigger login modal here
      return;
    }

    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <Header />

      {/* Hero Banner */}
      <section className="relative">
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              0% Making Charges on Silver Jewellery!
            </h2>
            <p className="text-gray-600 mb-6">
              Discover our exquisite collection of handcrafted jewelry
            </p>
            <Button
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3"
              onClick={() => router.push('/products')}
            >
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="text-center group cursor-pointer"
                onClick={() => router.push(`/category/${category.name.toLowerCase()}`)}
              >
                <div className="relative overflow-hidden rounded-full w-20 h-20 mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zeloura Essentials */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ZELOURA Essentials
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="overflow-hidden group cursor-pointer">
              <div className="relative">
                <img
                  src="https://ext.same-assets.com/1353514568/3683421439.jpeg"
                  alt="Heer by ZELOURA"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Heer by ZELOURA</h3>
                  <p className="text-sm opacity-90">Elegance redefined</p>
                </div>
              </div>
            </Card>
            <Card className="overflow-hidden group cursor-pointer">
              <div className="relative">
                <img
                  src="https://ext.same-assets.com/1353514568/1809348692.jpeg"
                  alt="Silver Jewellery"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">Silver Jewellery</h3>
                  <p className="text-sm opacity-90">Timeless beauty</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Shop by Recipient */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Shop by Recipient
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card
              className="overflow-hidden group cursor-pointer"
              onClick={() => router.push('/category/chains')}
            >
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-r from-gray-100 to-gray-200" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-800">
                    <h3 className="text-2xl font-bold mb-2">Him</h3>
                    <Button
                      variant="outline"
                      className="bg-white/90 text-gray-800 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/category/chains');
                      }}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            <Card
              className="overflow-hidden group cursor-pointer"
              onClick={() => router.push('/category/necklaces')}
            >
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-r from-rose-50 to-pink-100" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-800">
                    <h3 className="text-2xl font-bold mb-2">Her</h3>
                    <Button
                      variant="outline"
                      className="bg-white/90 text-gray-800 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/category/necklaces');
                      }}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Most Gifted */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Most Gifted
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => {
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
                          isWishlisted
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
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
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="px-8"
              onClick={() => router.push('/products')}
            >
              View More
            </Button>
          </div>
        </div>
      </section>

      {/* Shop By Price */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Shop By Price
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {priceRanges.map((range, index) => (
              <Card
                key={index}
                className={`cursor-pointer group overflow-hidden ${range.color} hover:shadow-lg transition-shadow`}
                onClick={() => router.push(range.link)}
              >
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium mb-1">{range.label}</p>
                  <p className="text-xl font-bold mb-2">{range.price}</p>
                  {range.subtitle && (
                    <p className="text-sm font-medium">{range.subtitle}</p>
                  )}
                  <div className="mt-4">
                    <Button
                      size="sm"
                      className={range.color.includes('gradient') ? 'bg-white text-pink-600 hover:bg-gray-100' : 'bg-pink-600 text-white hover:bg-pink-700'}
                    >
                      →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Colour */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Shop By Colour
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {colors.map((color, index) => (
              <Card
                key={index}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(color.link)}
              >
                <div className="relative">
                  <img
                    src={color.image}
                    alt={color.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold">{color.name}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Know More about ZELOURA
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => router.push('/products')} className="hover:text-pink-600">Customer Reviews</button></li>
                <li><button onClick={() => router.push('/about')} className="hover:text-pink-600">Our Blogs</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-pink-600">Store Locator</button></li>
                <li><button onClick={() => router.push('/about')} className="hover:text-pink-600">About Us</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-pink-600">Join Us</button></li>
                {/* Removed Gift Cards link */}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Info</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => router.push('/contact')} className="hover:text-pink-600">Shipping & Returns</button></li>
                <li><button onClick={() => router.push('/about')} className="hover:text-pink-600">Privacy Policy</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-pink-600">International Shipping</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-pink-600">FAQs & Support</button></li>
                <li><button onClick={() => router.push('/about')} className="hover:text-pink-600">Terms of Service</button></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Contact us</h3>
              <div className="text-sm text-gray-600 space-y-2">
                
                <p>For any suggestions, queries or complaints please contact us:</p>
                <p className="font-medium">Zeloura Fashions Private Limited</p>
                <p>Ernakulam, Kochi, 682505</p>
                <p>- care@zeloura.co</p>
                <p>- 8075338239 </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Subscribe for exclusive offers and updates!</h3>
              <div className="flex mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm"
                />
                <Button className="bg-pink-600 hover:bg-pink-700 text-white rounded-l-none">
                  →
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-gray-600">
            <p>© 2025, ZELOURA Jewellery</p>
          </div>
        </div>
      </footer>

      {/* Shopping Cart */}
      <ShoppingCart />

      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
}
