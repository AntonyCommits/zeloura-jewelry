import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ProductProvider } from "@/contexts/ProductContext";

export const metadata: Metadata = {
  title: "Zeloura - Exquisite Jewelry Collection",
  description: "Discover our stunning collection of handcrafted jewelry. From elegant rings to beautiful necklaces, find the perfect piece for every occasion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <AuthProvider>
          <AdminProvider>
            <ProductProvider>
              <CartProvider>
                {children}
              </CartProvider>
            </ProductProvider>
          </AdminProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
