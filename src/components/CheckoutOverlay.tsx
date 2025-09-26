"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-fade-in">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Coming Soon</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Our checkout system is currently under development. Please check back soon or contact us for orders.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/contact";
            }}
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}
