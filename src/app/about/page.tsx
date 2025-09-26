"use client";

import { Heart, Award, Shield, Users, MapPin, Phone, Mail } from 'lucide-react';
import Header from '@/components/Header';
import ShoppingCart from '@/components/ShoppingCart';
import LiveChatWidget from '@/components/LiveChatWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  const values = [
    {
      icon: Heart,
      title: "Crafted with Love",
      description: "Every piece of jewelry is handcrafted with passion and attention to detail, ensuring each item tells a unique story."
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We source only the finest materials and employ skilled artisans to create jewelry that stands the test of time."
    },
    {
      icon: Shield,
      title: "Trusted Heritage",
      description: "With years of experience in the jewelry industry, we've built a reputation for excellence and reliability."
    },
    {
      icon: Users,
      title: "Customer First",
      description: "Our customers are at the heart of everything we do. We're committed to providing exceptional service and experiences."
    }
  ];

  const team = [
    {
      name: "Antony",
      role: "Founder & CEO",
      image: "",
      description: ""
    },
    
  ];

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
          <span className="text-gray-800">About Us</span>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Zeloura</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Where tradition meets contemporary elegance. We believe that jewelry is more than just an accessory –
            it's a celebration of life's precious moments and a reflection of your unique style.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Our journey has been guided by a simple belief: everyone deserves to own beautiful,
                high-quality jewelry without breaking the bank. We've made it our mission to democratize
                luxury by offering exquisite pieces at accessible prices.
              </p>
              <p>
                Today, we're proud to serve customers across India, bringing joy and elegance
                to countless lives through our carefully curated collections.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://ext.same-assets.com/1353514568/about-story.jpg"
              alt="Zeloura Workshop"
              className="rounded-lg shadow-lg w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-lg"></div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-12 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              To make beautiful, high-quality jewelry accessible to everyone, while preserving the
              artistry and craftsmanship that makes each piece special. We're committed to ethical
              sourcing, sustainable practices, and creating lasting relationships with our customers.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">100K+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">500+</div>
                <div className="text-gray-600">Unique Designs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">8+</div>
                <div className="text-gray-600">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-pink-200">{member.role}</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Promise */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Quality Promise</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Materials & Sourcing</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 925 Sterling Silver jewelry</li>

                  <li>• Nickel-free, hypoallergenic materials</li>
                  <li>• Certified precious metals</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Quality Assurance</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Rigorous quality checks at every stage</li>
                  
                  <li>• 30-day return and exchange policy</li>
                  
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <MapPin className="h-8 w-8 text-pink-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Visit Our Store</h3>
              <p className="text-gray-600 text-sm">
                Ernakulam, Njarakkal 682505<br />
              </p>
            </Card>
            <Card className="p-6 text-center">
              <Phone className="h-8 w-8 text-pink-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 text-sm">
                +91 8075338239<br />

              </p>
            </Card>
            <Card className="p-6 text-center">
              <Mail className="h-8 w-8 text-pink-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 text-sm">
                care@zeloura.co<br />
                We reply within 24 hours
              </p>
            </Card>
          </div>
          <div className="mt-8">
            <Button
              className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3"
              onClick={() => router.push('/contact')}
            >
              Contact Us Today
            </Button>
          </div>
        </div>
      </div>

      <ShoppingCart />
      <LiveChatWidget />
    </div>
  );
}
