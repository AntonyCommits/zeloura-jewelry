"use client";

import { Search, MapPin, User, Heart, ShoppingCart, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModals from "./AuthModals";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pincode, setPincode] = useState<string>("");
  const [tempPincode, setTempPincode] = useState<string>("");
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [pincodeError, setPincodeError] = useState<string>("");

  const { state: cartState, toggleCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('deliveryPincode') : null;
      if (saved) {
        setPincode(saved);
        setTempPincode(saved);
      }
    } catch {}
  }, []);

  const openPincodeDialog = () => {
    setPincodeError("");
    setIsPincodeOpen(true);
  };

  const validatePincode = (code: string) => /^\d{6}$/.test(code.trim());

  const handleSavePincode = () => {
    if (!validatePincode(tempPincode)) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    setPincode(tempPincode.trim());
    try {
      localStorage.setItem('deliveryPincode', tempPincode.trim());
    } catch {}
    setIsPincodeOpen(false);
  };

  const handleClearPincode = () => {
    setPincode("");
    setTempPincode("");
    try {
      localStorage.removeItem('deliveryPincode');
    } catch {}
    setIsPincodeOpen(false);
  };

  const menuItems = [
    {
      title: "Shop by Category",
      items: [
        { name: "All", link: "/products" },
        { name: "Rings", link: "/category/rings" },
        { name: "Necklaces", link: "/category/necklaces" },
        { name: "Bracelets", link: "/category/bracelets" },
        { name: "Earrings", link: "/category/earrings" },
        { name: "Toe Rings", link: "/category/toe-rings" },
        { name: "Nose Pins", link: "/category/nose-pins" },
        { name: "Chains", link: "/category/chains" },
        { name: "Anklets", link: "/category/anklets" },
        { name: "Sets", link: "/category/sets" }
      ]
    },
    {
      title: "Gifting",
      items: [
        { name: "Gift For Him", link: "/gifting/him" },
        { name: "Gift For Her", link: "/gifting/her" },
        { name: "Gift For Kids", link: "/gifting/kids" },
        { name: "Gift For Occasions", link: "/gifting/occasions" },
        { name: "Anniversary", link: "/gifting/occasions/anniversary" },
        { name: "Wedding", link: "/gifting/occasions/wedding" },
        { name: "Birthday", link: "/gifting/occasions/birthday" },
        { name: "Couples", link: "/gifting/occasions/couples" }
      ]
    },
    { title: "About Us", link: "/about" },
    { title: "Contact Us", link: "/contact" },
    {
      title: "More at Zeloura",
      items: [
        { name: "Jewellery Care", link: "/care" },
        { name: "Our Blogs", link: "/blog" },
        { name: "Support & FAQs", link: "/faq" },
        { name: "Styling Tips", link: "/styling-tips" },
      ],
    }
  ];

  const handleMenuClick = (item: any) => {
    if (item.link) {
      router.push(item.link);
    } else if (item.items) {
      // Handle dropdown items
      return;
    }
  };

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      setIsProfileOpen(true);
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <>
      <header className="w-full">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 py-2 text-center text-sm">
          <span className="text-gray-700">
            Crafted with Love, Worn with Grace
          </span>
        </div>

        {/* Main Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4">
            {/* Top row with location and search */}
            <div className="flex items-center justify-between py-3">
              {/* Mobile menu */}
              <div className="lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="py-4">
                      <h2 className="text-lg font-semibold mb-4">Menu</h2>
                      {menuItems.map((item, index) => (
                        <div key={index} className="mb-3">
                          {item.items ? (
                            <div>
                              <div className="font-medium py-2 px-3 text-gray-900">{item.title}</div>
                              {item.items.map((subItem: any, subIndex: number) => (
                                <button
                                  key={subIndex}
                                  onClick={() => router.push(subItem.link)}
                                  className="text-left w-full py-2 px-6 hover:bg-gray-100 rounded text-gray-600"
                                >
                                  {subItem.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMenuClick(item)}
                              className="text-left w-full py-2 px-3 hover:bg-gray-100 rounded"
                            >
                              {item.title}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold tracking-wide">
                  <Link href="/" className="text-gray-800 hover:text-pink-600 transition-colors" aria-label="Go to homepage">
                    ZELOURA
                  </Link>
                </h1>
              </div>

              {/* Location selector */}
              <button
                type="button"
                onClick={openPincodeDialog}
                className="hidden md:flex items-center space-x-2 text-sm cursor-pointer hover:text-pink-600"
                aria-label="Set delivery pincode"
              >
                <MapPin className="h-4 w-4 text-gray-600" />
                <div className="text-left">
                  <div className="text-gray-700 font-medium">
                    {pincode ? `Delivering to ${pincode}` : 'Where to Deliver?'}
                  </div>
                  <div className="text-xs text-gray-500 underline">
                    {pincode ? 'Change Pincode' : 'Update Delivery Pincode'}
                  </div>
                </div>
              </button>

              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Input
                    placeholder="Search 'Evil Eye'"
                    className="pr-10 border-gray-300"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="hidden md:flex" onClick={openPincodeDialog} title="Set delivery pincode">
                  <MapPin className="h-5 w-5" />
                </Button>

                {/* User Icon */}
                <Button variant="ghost" size="icon" onClick={handleUserIconClick}>
                  <User className="h-5 w-5" />
                </Button>

                {/* Wishlist */}
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>

                {/* Shopping Cart */}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative" 
                  onClick={() => {
                    alert('Our online store is coming soon! Please check back later or contact us for orders.');
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartState.itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs min-w-5 h-5 flex items-center justify-center">
                      {cartState.itemCount}
                    </Badge>
                  )}
                </Button>

                {/* Admin Panel Access - only show for admin users */}
                {isAuthenticated && user?.isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:flex"
                    onClick={() => router.push('/admin')}
                    title="Admin Panel"
                  >
                    <Shield className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:block pb-3">
              <div className="flex items-center space-x-8">
                {menuItems.map((item, index) => (
                  <div key={index} className="relative group">
                    <button
                      className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                      onClick={() => handleMenuClick(item)}
                    >
                      {item.title}
                    </button>
                    {item.items && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="py-2">
                          {item.items.map((subItem: any, subIndex: number) => (
                            <button
                              key={subIndex}
                              onClick={() => router.push(subItem.link)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-pink-600"
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* User Welcome Message */}
            {isAuthenticated && user && (
              <div className="py-2 text-sm text-gray-600">
                Welcome back, <span className="font-medium text-pink-600">{user.name}</span>!
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Authentication Modals */}
      <AuthModals
        isLoginOpen={isLoginOpen}
        setIsLoginOpen={setIsLoginOpen}
        isSignupOpen={isSignupOpen}
        setIsSignupOpen={setIsSignupOpen}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
      />

      {/* Pincode Dialog */}
      <Dialog open={isPincodeOpen} onOpenChange={setIsPincodeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delivery Pincode</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Enter 6-digit pincode"
              value={tempPincode}
              onChange={(e) => {
                setTempPincode(e.target.value);
                if (pincodeError) setPincodeError("");
              }}
              inputMode="numeric"
              maxLength={6}
            />
            {pincodeError && (
              <p className="text-xs text-red-600">{pincodeError}</p>
            )}
          </div>
          <DialogFooter>
            {pincode && (
              <Button variant="ghost" onClick={handleClearPincode}>Clear</Button>
            )}
            <Button onClick={handleSavePincode}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
