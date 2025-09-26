"use client";

import { useState } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Package, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
}

export default function ShoppingCart() {
  const { state, updateQuantity, removeFromCart, closeCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkoutData, setCheckoutData] = useState({
    shipping: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    payment: {
      method: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
    }
  });

  const steps: CheckoutStep[] = [
    { id: 'cart', title: 'Cart Review', completed: false },
    { id: 'shipping', title: 'Shipping Details', completed: false },
    { id: 'payment', title: 'Payment', completed: false },
    { id: 'confirmation', title: 'Order Confirmation', completed: false },
  ];

  const subtotal = state.total;
  const shipping = subtotal > 2000 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Handle user authentication requirement
      alert('Please login to continue with checkout');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleStepComplete = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Process order
      alert('Order placed successfully!');
      setIsCheckoutOpen(false);
      setCurrentStep(0);
      closeCart();
    }
  };

  const renderCartItems = () => (
    <div className="space-y-4">
      {state.items.map((item) => (
        <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded-md"
          />
          <div className="flex-1 space-y-2">
            <h3 className="font-medium line-clamp-2">{item.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {item.color && <p>Color: {item.color}</p>}
              {item.size && <p>Size: {item.size}</p>}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                {item.originalPrice > item.price && (
                  <p className="text-sm text-gray-500 line-through">
                    ₹{(item.originalPrice * item.quantity).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => removeFromCart(item.id)}
            className="p-2 hover:bg-gray-100 rounded text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );

  const renderOrderSummary = () => (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="font-semibold">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({state.itemCount} items)</span>
            <span>₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (GST 18%)</span>
            <span>₹{tax.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
        </div>
        {shipping === 0 && (
          <Badge className="bg-green-100 text-green-800 w-full justify-center">
            🎉 You saved ₹99 on shipping!
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  const renderShippingForm = () => (
    <div className="space-y-4">
      <h3 className="font-semibold">Shipping Details</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md"
            value={checkoutData.shipping.name}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, name: e.target.value }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full p-3 border rounded-md"
            value={checkoutData.shipping.email}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, email: e.target.value }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            className="w-full p-3 border rounded-md"
            value={checkoutData.shipping.phone}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, phone: e.target.value }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Pincode</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md"
            value={checkoutData.shipping.pincode}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, pincode: e.target.value }
            }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Address</label>
          <textarea
            className="w-full p-3 border rounded-md h-24"
            value={checkoutData.shipping.address}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, address: e.target.value }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md"
            value={checkoutData.shipping.city}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, city: e.target.value }
            }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">State</label>
          <input
            type="text"
            className="w-full p-3 border rounded-md"
            value={checkoutData.shipping.state}
            onChange={(e) => setCheckoutData(prev => ({
              ...prev,
              shipping: { ...prev.shipping, state: e.target.value }
            }))}
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-4">
      <h3 className="font-semibold">Payment Details</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`p-3 border rounded-md text-center ${
                checkoutData.payment.method === 'card' ? 'border-pink-600 bg-pink-50' : ''
              }`}
              onClick={() => setCheckoutData(prev => ({
                ...prev,
                payment: { ...prev.payment, method: 'card' }
              }))}
            >
              <CreditCard className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">Card</span>
            </button>
            <button
              className={`p-3 border rounded-md text-center ${
                checkoutData.payment.method === 'upi' ? 'border-pink-600 bg-pink-50' : ''
              }`}
              onClick={() => setCheckoutData(prev => ({
                ...prev,
                payment: { ...prev.payment, method: 'upi' }
              }))}
            >
              <Package className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">UPI</span>
            </button>
            <button
              className={`p-3 border rounded-md text-center ${
                checkoutData.payment.method === 'cod' ? 'border-pink-600 bg-pink-50' : ''
              }`}
              onClick={() => setCheckoutData(prev => ({
                ...prev,
                payment: { ...prev.payment, method: 'cod' }
              }))}
            >
              <Package className="h-6 w-6 mx-auto mb-1" />
              <span className="text-sm">COD</span>
            </button>
          </div>
        </div>

        {checkoutData.payment.method === 'card' && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 border rounded-md"
                value={checkoutData.payment.cardNumber}
                onChange={(e) => setCheckoutData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, cardNumber: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-3 border rounded-md"
                value={checkoutData.payment.expiryDate}
                onChange={(e) => setCheckoutData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, expiryDate: e.target.value }
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <input
                type="text"
                placeholder="123"
                className="w-full p-3 border rounded-md"
                value={checkoutData.payment.cvv}
                onChange={(e) => setCheckoutData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, cvv: e.target.value }
                }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Name on Card</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md"
                value={checkoutData.payment.nameOnCard}
                onChange={(e) => setCheckoutData(prev => ({
                  ...prev,
                  payment: { ...prev.payment, nameOnCard: e.target.value }
                }))}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCheckoutContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="font-semibold">Review Your Cart</h3>
            {renderCartItems()}
            {renderOrderSummary()}
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            {renderShippingForm()}
            {renderOrderSummary()}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {renderPaymentForm()}
            {renderOrderSummary()}
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
              <Package className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Order Confirmed!</h3>
              <p className="text-gray-600">Thank you for your purchase. Your order will be delivered in 3-5 business days.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Order ID: #ZEL{Date.now()}</p>
              <p className="text-sm text-gray-600">Total: ₹{total.toLocaleString()}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Cart Sidebar */}
      <Sheet open={state.isOpen} onOpenChange={closeCart}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart ({state.itemCount})
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 flex-1 overflow-y-auto">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <Button onClick={closeCart}>Continue Shopping</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {renderCartItems()}
                {renderOrderSummary()}

                <div className="space-y-3">
                  <Button
                    className="w-full bg-pink-600 hover:bg-pink-700"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="w-full" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${index <= currentStep ? 'text-pink-600' : 'text-gray-600'}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${index < currentStep ? 'bg-pink-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {renderCheckoutContent()}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleStepComplete}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
