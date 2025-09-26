"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, MessageCircle, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import LiveChatWidget from '@/components/LiveChatWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function FAQPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'orders', name: 'Orders & Payment' },
    { id: 'shipping', name: 'Shipping & Delivery' },
    { id: 'returns', name: 'Returns & Exchange' },
    { id: 'products', name: 'Products & Quality' },
    { id: 'account', name: 'Account & Profile' },
    { id: 'care', name: 'Jewelry Care' }
  ];

  const faqs = [
    // Orders & Payment
    {
      category: 'orders',
      question: 'How can I place an order?',
      answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. We accept all major credit cards, debit cards, UPI, net banking, and cash on delivery.'
    },
    {
      category: 'orders',
      question: 'What payment methods do you accept?',
      answer: 'We accept Visa, MasterCard, American Express, Rupay cards, UPI payments (PhonePe, Google Pay, Paytm), net banking from all major banks, and cash on delivery for orders above ₹500.'
    },
    {
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'You can modify or cancel your order within 30 minutes of placing it. After that, please contact our customer service team at care@zeloura.co or call +91 8075338239.'
    },
    {
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you\'ll receive a tracking number via email and SMS. You can track your order on our website or the courier partner\'s website using this tracking number.'
    },

    // Shipping & Delivery
    {
      category: 'shipping',
      question: 'What is your shipping policy?',
      answer: 'We offer free shipping on all orders above ₹2000. For orders below ₹2000, shipping charges of ₹99 apply. We ship across India and typically deliver within 3-7 business days.'
    },
    {
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-7 business days for most locations in India. For remote areas, it may take 7-10 business days. Express delivery (1-2 days) is available in select cities for an additional charge.'
    },
    {
      category: 'shipping',
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within India. We are working on expanding our international shipping capabilities and will update our customers when this becomes available.'
    },
    {
      category: 'shipping',
      question: 'What if I\'m not available during delivery?',
      answer: 'Our courier partners will attempt delivery 3 times. If unsuccessful, the package will be held at the local facility for 7 days. You\'ll receive notifications to arrange redelivery or pickup.'
    },

    // Returns & Exchange
    {
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy from the date of delivery. Items must be in original condition with tags and packaging intact. Customized or personalized items cannot be returned.'
    },
    {
      category: 'returns',
      question: 'How do I return an item?',
      answer: 'To return an item, contact our customer service team to initiate the return process. We\'ll arrange a pickup from your address at no additional cost. Refunds are processed within 7-10 business days after we receive the item.'
    },
    {
      category: 'returns',
      question: 'Can I exchange an item for a different size or color?',
      answer: 'Yes, exchanges are available within 30 days of delivery. The item must be in original condition. You can exchange for a different size, color, or even a different product of equal or lesser value.'
    },
    {
      category: 'returns',
      question: 'Are there any items that cannot be returned?',
      answer: 'Personalized, engraved, or customized jewelry cannot be returned unless there\'s a manufacturing defect. Earrings cannot be returned for hygiene reasons unless they arrive damaged.'
    },

    // Products & Quality
    {
      category: 'products',
      question: 'What materials do you use in your jewelry?',
      answer: 'We craft our pieces in 925 sterling silver. All our jewelry is nickel-free and hypoallergenic. Each product page contains detailed material information.'
    },
    {
      category: 'products',
      question: 'Do you provide certificates for your jewelry?',
      answer: 'Yes, all our jewelry comes with authenticity certificates. Gold and silver jewelry includes purity certificates, and gemstone jewelry includes gemstone authenticity certificates.'
    },
    {
      category: 'products',
      question: 'What is your quality guarantee?',
      answer: 'We offer a 1-year manufacturing warranty on all jewelry. This covers defects in materials and craftsmanship but not damage from normal wear, accidents, or improper care.'
    },
    {
      category: 'products',
      question: 'How do I choose the right size for rings and bracelets?',
      answer: 'We provide detailed size guides on each product page. For rings, you can use our printable ring sizer or visit any local jeweler for professional sizing. For bracelets, most of our pieces are adjustable.'
    },

    // Account & Profile
    {
      category: 'account',
      question: 'Do I need to create an account to place an order?',
      answer: 'While you can checkout as a guest, creating an account allows you to track orders, save addresses, maintain a wishlist, and earn loyalty points for future purchases.'
    },
    {
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link within a few minutes. Check your spam folder if you don\'t see the email.'
    },
    {
      category: 'account',
      question: 'Can I change my email address?',
      answer: 'Yes, you can update your email address in your account settings. For security purposes, you\'ll need to verify the new email address before the change takes effect.'
    },

    // Jewelry Care
    {
      category: 'care',
      question: 'How should I care for my silver jewelry?',
      answer: 'Store silver jewelry in anti-tarnish pouches or airtight containers. Clean with a soft cloth after each wear. For deeper cleaning, use a silver polishing cloth or mild soap solution. Avoid exposure to chemicals and perfumes.'
    },
    // Removed gold-plated care since we only sell silver now
    {
      category: 'care',
      question: 'Can I wear my jewelry while swimming or exercising?',
      answer: 'We recommend removing jewelry before swimming, exercising, or showering. Chlorine, salt water, sweat, and harsh soaps can damage jewelry and accelerate tarnishing or wear.'
    },
    {
      category: 'care',
      question: 'How often should I clean my jewelry?',
      answer: 'Clean your jewelry after each wear with a soft cloth to remove oils and dirt. Deep cleaning should be done monthly or as needed. Professional cleaning is recommended annually for valuable pieces.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <button onClick={() => router.push('/')} className="hover:text-pink-600">
            Home
          </button>
          <span>/</span>
          <span className="text-gray-800">FAQ</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our jewelry, orders, shipping, and more.
            Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`${
                selectedCategory === category.id
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "hover:bg-pink-50"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* FAQ List */}
          <div className="space-y-4 mb-12">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-0">
                    <button
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => toggleFAQ(index)}
                    >
                      <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                      {expandedFAQ === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any questions matching your search. Try different keywords or browse by category.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Support */}
          <Card className="bg-gradient-to-r from-pink-50 to-rose-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
              <p className="text-gray-600 mb-6">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>

              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 p-4 h-auto"
                  onClick={() => window.open('tel:+918075338239')}
                >
                  <Phone className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Call Us</div>
                    <div className="text-sm text-gray-600">+91 8075338239</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 p-4 h-auto"
                  onClick={() => window.open('mailto:care@zeloura.co')}
                >
                  <Mail className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Email Us</div>
                    <div className="text-sm text-gray-600">care@zeloura.co</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 p-4 h-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Live Chat</div>
                    <div className="text-sm text-gray-600">Chat with us</div>
                  </div>
                </Button>
              </div>

              <div className="mt-6">
                <Button
                  className="bg-pink-600 hover:bg-pink-700"
                  onClick={() => router.push('/contact')}
                >
                  Contact Support Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ShoppingCart />
      <LiveChatWidget />
    </div>
  );
}
