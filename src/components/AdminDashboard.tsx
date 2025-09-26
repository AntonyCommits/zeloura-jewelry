"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Star,
  Eye,
  MessageSquare,
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Reply,
  Trash2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Review,
  getReviewsForModeration,
  getReviewsStats,
  moderateReview,
  addAdminReply,
  getReviewsForProduct
} from '@/data/reviews';
import { getProductById } from '@/data/products';
import ProductManagement from './ProductManagement';

interface AdminDashboardProps {
  className?: string;
}

export default function AdminDashboard({ className = '' }: AdminDashboardProps) {
  const { admin, hasPermission, logout, isAuthenticated } = useAdmin();
  const { user } = useAuth();
  
  // Debug logging
  useEffect(() => {
    console.log('AdminDashboard mounted with admin state:', { 
      admin, 
      isAuthenticated,
      permissions: admin?.permissions,
      hasModeratePermission: hasPermission?.('reviews', 'moderate')
    });
  }, [admin, isAuthenticated, hasPermission]);
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'flagged' | 'all' | 'products'>('overview');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'flagged' | 'rejected'>('all');

  const handleReply = async () => {
    if (!selectedReview?.id || !admin?.id || !replyText.trim()) {
      console.error('Missing required data for reply');
      return;
    }

    try {
      const reply = await addAdminReply(
        selectedReview.id,
        admin.id,
        admin.name,
        admin.role,
        replyText.trim()
      );

      if (reply) {
        // Update the selected review with the new reply
        const updatedReview = {
          ...selectedReview,
          adminReplies: [...(selectedReview.adminReplies || []), reply]
        };
        
        // Update the reviews list
        setReviews(reviews.map(r => 
          r.id === selectedReview.id ? updatedReview : r
        ));
        
        // Update the selected review
        setSelectedReview(updatedReview);
        
        // Clear the reply text
        setReplyText('');
        
        alert('Reply sent successfully!');
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    }
  };

  const stats = getReviewsStats();

  const loadReviews = useCallback(() => {
    try {
      let reviewsData: Review[] = [];

      switch (activeTab) {
        case 'pending':
          reviewsData = getReviewsForModeration('pending');
          break;
        case 'flagged':
          reviewsData = getReviewsForModeration('flagged');
          break;
        case 'all':
          // Get all reviews and filter for non-approved ones
          reviewsData = getReviewsForModeration().filter(
            review => review.status !== 'approved'
          );
          break;
        case 'products':
          return; // Don't load reviews for products tab
        default:
          // For overview, get recent reviews (first 10)
          reviewsData = getReviewsForModeration().slice(0, 10);
      }

      // Apply additional status filter if needed
      if (filterStatus !== 'all') {
        reviewsData = reviewsData.filter(review => review.status === filterStatus);
      }

      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Handle error appropriately, e.g., show error message to user
      setReviews([]);
    }
  }, [activeTab, filterStatus]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleModeration = async (reviewId: string, action: 'approve' | 'reject' | 'flag') => {
    if (!admin?.id) {
      console.error('Unauthorized: Admin not logged in');
      console.log('Admin state:', { admin });
      return;
    }
    
    if (!hasPermission('reviews', 'moderate')) {
      console.error('Unauthorized: Missing required permissions');
      console.log('Admin permissions:', admin.permissions);
      console.log('Has permission (reviews, moderate):', hasPermission('reviews', 'moderate'));
      return;
    }

    try {
      const success = await moderateReview(reviewId, action, admin.id, moderationNote || undefined);
      if (success) {
        await loadReviews();
        setSelectedReview?.(null);
        setModerationNote?.('');
        alert(`Review ${action}ed successfully!`);
      } else {
        alert('Failed to moderate review. Please try again.');
      }
    } catch (error) {
      console.error('Error during moderation:', error);
      alert('An error occurred while processing your request.');
    }
  };

  const handleAdminReply = async () => {
    if (!admin?.id || !selectedReview?.id || !replyText.trim()) {
      console.error('Missing required data for admin reply');
      return;
    }

    try {
      const reply = await addAdminReply(
        selectedReview.id,
        admin.id,
        `${admin.name} - ${admin.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        admin.role,
        replyText.trim()
      );

      if (reply) {
        // Update the selected review with the new reply
        const updatedReview = {
          ...selectedReview,
          adminReplies: [...(selectedReview.adminReplies || []), reply]
        };
        setSelectedReview(updatedReview);
        setReplyText('');
        alert('Reply added successfully!');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  const handleAction = (action: 'approve' | 'reject' | 'flag', data: { id: string }) => {
    if (!data?.id) {
      console.error('Invalid review data');
      return;
    }
    void handleModeration(data.id, action);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'flagged': return <Flag className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
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

  const isAuthAdmin = !!user?.isAdmin;
  const canRead = isAuthAdmin || (admin && hasPermission('reviews', 'read'));
  if (!canRead) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {activeTab === 'products' ? 'Product Management Dashboard' : 'Review Management Dashboard'}
          </h1>
          <p className="text-gray-600">Welcome back, {admin?.name || user?.name || 'Admin'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Overview - Only show for review tabs */}
      {activeTab !== 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Flag className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', count: Math.min(10, reviews.length) },
            { id: 'pending', label: 'Pending Review', count: stats.pending || 0 },
            { id: 'flagged', label: 'Flagged', count: stats.flagged || 0 },
            { id: 'all', label: 'All Reviews', count: stats.total || 0 },
            { id: 'products', label: 'Products', count: 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab.id as 'overview' | 'pending' | 'flagged' | 'all' | 'products')}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge className="ml-2 bg-gray-100 text-gray-800">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Show Products Management or Reviews based on active tab */}
      {activeTab === 'products' ? (
        <ProductManagement />
      ) : (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="flagged">Flagged</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {reviews.length} reviews
            </div>
          </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">No reviews match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => {
            const product = getProductById(review.productId);
            return (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Review Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(review.status)}>
                          {getStatusIcon(review.status)}
                          <span className="ml-1 capitalize">{review.status}</span>
                        </Badge>

                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>

                        {review.isVerifiedPurchase && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Verified Purchase
                          </Badge>
                        )}

                        {review.flags && review.flags.length > 0 && (
                          <Badge className="bg-red-100 text-red-800">
                            {review.flags.length} Flag(s)
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Product:</strong> {product?.name || 'Unknown Product'} •
                        <strong> Customer:</strong> {review.userName} •
                        <strong> Date:</strong> {review.date.toLocaleDateString()}
                      </div>

                      {/* Review Content */}
                      <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      {/* Admin Replies */}
                      {review.adminReplies && review.adminReplies.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Admin Replies:</p>
                          {review.adminReplies.map((reply) => (
                            <div key={reply.id} className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-blue-900">
                                  {reply.adminName}
                                </span>
                                <span className="text-xs text-blue-600">
                                  {reply.date.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-blue-800">{reply.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReview(review)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      {(isAuthAdmin || hasPermission('reviews', 'write')) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        </div>
        </>
      )}

      {/* Review Detail Modal - Only show for review tabs */}
      {activeTab !== 'products' && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle>Review Details & Management</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Review Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Product</p>
                      <p className="text-gray-900">{getProductById(selectedReview.productId)?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Customer</p>
                      <p className="text-gray-900">{selectedReview.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Rating</p>
                      <div className="flex items-center gap-1">
                        {renderStars(selectedReview.rating)}
                        <span className="ml-2">{selectedReview.rating}/5</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-gray-900">{selectedReview.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">{selectedReview.title}</h3>
                  <p className="text-gray-700 mb-4">{selectedReview.comment}</p>

                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Customer Images:</p>
                      <div className="flex gap-2">
                        {selectedReview.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation Section */}
                {(isAuthAdmin || hasPermission('reviews', 'moderate')) && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Moderation Actions</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Moderation Note (optional)
                        </label>
                        <textarea
                          value={moderationNote}
                          onChange={(e) => setModerationNote(e.target.value)}
                          placeholder="Add a note about your moderation decision..."
                          className="w-full p-3 border border-gray-300 rounded-md"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        {selectedReview.status === 'pending' && (
                          <>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleModeration(selectedReview.id, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Review
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleModeration(selectedReview.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Review
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => handleModeration(selectedReview.id, 'flag')}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          Flag Review
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply Section */}
                {(isAuthAdmin || hasPermission('reviews', 'write')) && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">Customer Service Reply</h4>

                    <div className="space-y-4">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a response to this customer..."
                        className="w-full p-3 border border-gray-300 rounded-md"
                        rows={4}
                      />

                      <Button
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
