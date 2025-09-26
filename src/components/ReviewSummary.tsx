"use client";

import { Star, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getReviewSummary } from '@/data/reviews';

interface ReviewSummaryProps {
  productId: string;
  onWriteReview?: () => void;
  className?: string;
}

export default function ReviewSummary({ productId, onWriteReview, className = '' }: ReviewSummaryProps) {
  const summary = getReviewSummary(productId);

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingPercentage = (count: number) => {
    return summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
  };

  if (summary.totalReviews === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-8 w-8 text-gray-300" />
            <span className="text-2xl font-bold text-gray-400">0.0</span>
          </div>
          <p className="text-gray-600 mb-4">No reviews yet</p>
          <p className="text-sm text-gray-500 mb-4">Be the first to share your experience</p>
          {onWriteReview && (
            <Button onClick={onWriteReview} className="bg-pink-600 hover:bg-pink-700">
              Write First Review
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl font-bold text-gray-900">{summary.averageRating}</span>
            <div className="flex items-center gap-1">
              {renderStars(summary.averageRating, 'lg')}
            </div>
          </div>
          <p className="text-gray-600">
            Based on {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Rating Breakdown</h4>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = summary.ratingDistribution[rating as keyof typeof summary.ratingDistribution];
            const percentage = getRatingPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Review Highlights */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((summary.ratingDistribution[5] + summary.ratingDistribution[4]) / summary.totalReviews * 100)}%
            </div>
            <div className="text-sm text-gray-600">Positive Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">
              {summary.ratingDistribution[5]}
            </div>
            <div className="text-sm text-gray-600">5-Star Reviews</div>
          </div>
        </div>

        {/* Write Review Button */}
        {onWriteReview && (
          <Button
            onClick={onWriteReview}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            Write a Review
          </Button>
        )}

        {/* Trust Indicators */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Why trust our reviews?</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Only verified purchasers can review</li>
            <li>• Reviews are moderated for authenticity</li>
            <li>• Photos are from real customers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
