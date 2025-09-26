import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  increment,
  Timestamp,
  DocumentData,
  WithFieldValue,
  QueryDocumentSnapshot,
  arrayUnion,
} from 'firebase/firestore';

// Simple static reviews for testing
const staticReviews = [
  {
    id: '1',
    productId: 'test-product',
    userId: 'user1',
    userName: 'John Doe',
    rating: 5,
    title: 'Excellent Product',
    comment: 'This product exceeded my expectations.',
    isVerifiedPurchase: true,
    helpfulCount: 12,
    date: new Date('2024-01-15'),
    status: 'approved' as const
  }
];

// Initialize with static data
let reviewsCache = staticReviews;

// Simple function to set reviews
export const setReviewsCache = (reviews: any[]) => {
  reviewsCache = reviews;
};

export const getReviewsForProduct = (productId: string) => {
  return reviewsCache.filter(review => 
    review.productId === productId && 
    review.status === 'approved'
  );
};

export const getReviewsForModeration = (status?: 'pending' | 'flagged') => {
  if (status) {
    return reviewsCache.filter(review => review.status === status);
  }
  return reviewsCache.filter(review => review.status === 'pending' || review.status === 'flagged');
};

export const getReviewsStats = () => {
  const totalReviews = reviewsCache.length;
  const approvedCount = reviewsCache.filter(r => r.status === 'approved').length;
  
  return {
    productId: 'all',
    totalReviews,
    averageRating: 4.5,
    ratingDistribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 },
    total: totalReviews,
    approved: approvedCount,
    pending: 0,
    flagged: 0,
    approvalRate: 100
  };
};

export const addReview = async (review: any): Promise<boolean> => {
  try {
    if (!db) return false;
    await addDoc(collection(db, 'reviews'), {
      ...review,
      status: 'pending',
      helpfulCount: 0,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    return false;
  }
};

export const markReviewHelpful = async (reviewId: string) => {
  if (!db) return false;
  
  try {
    await updateDoc(doc(db, 'reviews', reviewId), { helpfulCount: increment(1) });
    const reviewIndex = reviewsCache.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      reviewsCache[reviewIndex].helpfulCount++;
    }
    return true;
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    return false;
  }
};

export const moderateReview = async (reviewId: string, action: 'approve' | 'reject' | 'flag', adminId: string, note?: string): Promise<boolean> => {
  if (!db) return false;

  try {
    const updateData: any = {
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
      moderatedBy: adminId,
      moderatedAt: new Date(),
    };

    if (note) {
      updateData.moderationNote = note;
    }

    await updateDoc(doc(db, 'reviews', reviewId), updateData);

    const reviewIndex = reviewsCache.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      Object.assign(reviewsCache[reviewIndex], updateData);
    }

    return true;
  } catch (error) {
    console.error('Error moderating review:', error);
    return false;
  }
};

export const addAdminReply = async (
  reviewId: string, 
  adminId: string, 
  adminName: string, 
  adminRole: string, 
  message: string
) => {
  if (!db) return null;

  try {
    const reply = {
      id: Math.random().toString(36).substr(2, 9),
      adminId,
      adminName,
      adminRole,
      message,
      date: new Date(),
    };

    await updateDoc(doc(db, 'reviews', reviewId), {
      adminReplies: arrayUnion({
        ...reply,
        date: Timestamp.fromDate(reply.date)
      })
    });

    const reviewIndex = reviewsCache.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      if (!reviewsCache[reviewIndex].adminReplies) {
        reviewsCache[reviewIndex].adminReplies = [];
      }
      reviewsCache[reviewIndex].adminReplies!.push(reply);
    }

    return reply;
  } catch (error) {
    console.error('Error adding admin reply:', error);
    return null;
  }
};

export const getReviewSummary = (productId: string) => {
  const productReviews = reviewsCache.filter(r => r.productId === productId && r.status === 'approved');
  const totalReviews = productReviews.length;
  
  if (totalReviews === 0) {
    return {
      productId,
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }
  
  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;
  
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach(review => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    }
  });
  
  return {
    productId,
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews,
    ratingDistribution
  };
};