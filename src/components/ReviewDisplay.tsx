"use client";

import { useState } from 'react';
import { Star, ThumbsUp, Camera, Shield, Calendar, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Review, getReviewsForProduct, markReviewHelpful } from '@/data/reviews';

interface ReviewDisplayProps {
  productId: string;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1' | 'verified' | 'photos';

export default function ReviewDisplay({ productId, className = '' }: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>(getReviewsForProduct(productId));
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showAllReviews, setShowAllReviews] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest', label: 'Lowest Rated' },
    { value: 'helpful', label: 'Most Helpful' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
    { value: 'verified', label: 'Verified Purchase' },
    { value: 'photos', label: 'With Photos' },
  ];

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    const sortedReviews = [...reviews];

    switch (option) {
      case 'newest':
        sortedReviews.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case 'oldest':
        sortedReviews.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case 'highest':
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        sortedReviews.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
    }

    setReviews(sortedReviews);
  };

  const handleFilter = (option: FilterOption) => {
    setFilterBy(option);
    let baseReviews = getReviewsForProduct(productId);

    switch (option) {
      case 'all':
        break;
      case '5':
      case '4':
      case '3':
      case '2':
      case '1':
        baseReviews = baseReviews.filter(r => r.rating === parseInt(option));
        break;
      case 'verified':
        baseReviews = baseReviews.filter(r => r.isVerifiedPurchase);
        break;
      case 'photos':
        baseReviews = baseReviews.filter(r => r.images && r.images.length > 0);
        break;
    }

    setReviews(baseReviews);
    handleSort(sortBy); // Re-apply current sort
  };

  const handleHelpful = (reviewId: string) => {
    markReviewHelpful(reviewId);
    setReviews(prev => prev.map(review =>
      review.id === reviewId
        ? { ...review, helpfulCount: review.helpfulCount + 1 }
        : review
    ));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-gray-50 rounded-lg p-8">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600 mb-4">Be the first to review this product!</p>
          <Button className="bg-pink-600 hover:bg-pink-700">Write a Review</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <select
            value={filterBy}
            onChange={(e) => handleFilter(e.target.value as FilterOption)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value as SortOption)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {displayedReviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {review.userAvatar ? (
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    review.userName.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                        {review.isVerifiedPurchase && (
                          <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(review.date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>

                  {/* Product Details */}
                  {(review.size || review.color) && (
                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      {review.size && (
                        <span>Size: <strong>{review.size}</strong></span>
                      )}
                      {review.color && (
                        <span>Color: <strong>{review.color}</strong></span>
                      )}
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.map((image, index) => (
                        <Dialog key={index}>
                          <DialogTrigger asChild>
                            <button className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-colors">
                              <img
                                src={image}
                                alt={`Review image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Camera className="h-4 w-4 text-white" />
                              </div>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <img
                              src={image}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  )}

                  {/* Admin Replies */}
                  {review.adminReplies && review.adminReplies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {review.adminReplies.map((reply) => (
                        <div key={reply.id} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {reply.adminName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-blue-900">{reply.adminName}</span>
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    Team Zeloura
                                  </Badge>
                                </div>
                                <span className="text-xs text-blue-600">
                                  {formatDate(reply.date)}
                                </span>
                              </div>
                              <p className="text-blue-800 leading-relaxed">{reply.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(review.id)}
                      className="text-gray-600 hover:text-pink-600"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpfulCount})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {!showAllReviews && reviews.length > 3 && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(true)}
            className="flex items-center gap-2"
          >
            Show All {reviews.length} Reviews
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Show Less Button */}
      {showAllReviews && reviews.length > 3 && (
        <div className="text-center mt-6">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(false)}
          >
            Show Less
          </Button>
        </div>
      )}
    </div>
  );
}
