import { db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
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

export interface AdminReply {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  message: string;
  date: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  images?: string[]; // User uploaded images
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  date: Date;
  size?: string; // If applicable
  color?: string; // If applicable
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNote?: string;
  adminReplies?: AdminReply[];
  flags?: {
    reason: string;
    reportedBy: string;
    reportedAt: Date;
  }[];
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  // Additional properties for AdminDashboard
  total?: number;
  approved?: number;
  pending?: number;
  flagged?: number;
  approvalRate?: number;
}

// Type for Firestore document data
interface ReviewDocument extends Omit<Review, 'id' | 'date' | 'moderatedAt' | 'adminReplies' | 'flags'> {
  createdAt: Timestamp | Date;
  moderatedAt?: Timestamp | Date | null;
  adminReplies?: Array<Omit<AdminReply, 'date'> & { date: Timestamp | Date }>;
  flags?: Array<{
    reason: string;
    reportedBy: string;
    reportedAt: Timestamp | Date;
  }>;
}

// Realtime cache backed by Firestore
let reviewsCache: Review[] = [];

// Helper function to convert Firestore data to Review
const mapDocToReview = (doc: QueryDocumentSnapshot<DocumentData>): Review => {
  const data = doc.data() as ReviewDocument;
  
  const mapDate = (dateValue: Timestamp | Date | undefined | null): Date | undefined => {
    if (!dateValue) return undefined;
    return dateValue instanceof Timestamp ? dateValue.toDate() : new Date(dateValue);
  };

  const review: Review = {
    id: doc.id,
    productId: data.productId,
    userId: data.userId,
    userName: data.userName,
    userAvatar: data.userAvatar,
    rating: data.rating,
    title: data.title,
    comment: data.comment,
    images: data.images || [],
    isVerifiedPurchase: !!data.isVerifiedPurchase,
    helpfulCount: data.helpfulCount || 0,
    date: mapDate(data.createdAt) || new Date(),
    size: data.size,
    color: data.color,
    status: data.status || 'pending',
    moderatedBy: data.moderatedBy,
    moderatedAt: mapDate(data.moderatedAt),
    moderationNote: data.moderationNote,
    adminReplies: [],
    flags: []
  };

  // Handle adminReplies if they exist
  if (data.adminReplies) {
    review.adminReplies = data.adminReplies.map(reply => ({
      ...reply,
      date: mapDate(reply.date) || new Date(),
    }));
  }

  // Handle flags if they exist
  if (data.flags) {
    review.flags = data.flags.map(flag => ({
      reason: flag.reason,
      reportedBy: flag.reportedBy,
      reportedAt: mapDate(flag.reportedAt) || new Date(),
    }));
  }

  return review;
};

// Subscribe immediately on module load
(() => {
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      reviewsCache = snapshot.docs.map(mapDocToReview);
    });
  } catch (e) {
    console.warn('Reviews subscription failed to start', e);
  }
})();

export const getReviewsForProduct = (productId: string): Review[] => {
  if (!productId) return [];
  return reviewsCache.filter(review => 
    review.productId === productId && 
    review.status === 'approved'
  );
};

export const getReviewsForModeration = (status?: 'pending' | 'flagged'): Review[] => {
  if (status) {
    return reviewsCache.filter(review => review.status === status);
  }
  return reviewsCache.filter(review => review.status === 'pending' || review.status === 'flagged');
};

export const getReviewsStats = (): ReviewSummary => {
  if (reviewsCache.length === 0) {
    return {
      productId: 'all',
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      total: 0,
      approved: 0,
      pending: 0,
      flagged: 0,
      approvalRate: 0
    };
  }
  
  const totalRating = reviewsCache.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviewsCache.length;
  
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let approvedCount = 0;
  let pendingCount = 0;
  let flaggedCount = 0;
  
  reviewsCache.forEach(review => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating as keyof typeof ratingDistribution]++;
    }
    
    if (review.status === 'approved') approvedCount++;
    else if (review.status === 'pending') pendingCount++;
    else if (review.status === 'flagged') flaggedCount++;
  });
  
  const total = reviewsCache.length;
  const approvalRate = approvedCount > 0 ? Math.round((approvedCount / total) * 100) : 0;
  
  return {
    productId: 'all',
    totalReviews: total,
    averageRating: parseFloat(averageRating.toFixed(1)),
    ratingDistribution,
    total,
    approved: approvedCount,
    pending: pendingCount,
    flagged: flaggedCount,
    approvalRate
  };
};

interface NewReviewData extends Omit<Review, 'id' | 'date' | 'status' | 'helpfulCount' | 'adminReplies' | 'flags' | 'moderatedAt' | 'moderatedBy' | 'moderationNote'> {}

export const addReview = async (review: NewReviewData): Promise<boolean> => {
  try {
    const reviewData: WithFieldValue<DocumentData> = {
      ...review,
      status: 'pending',
      helpfulCount: 0,
      adminReplies: [],
      flags: [],
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, 'reviews'), reviewData);
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    return false;
  }
};

export const markReviewHelpful = async (reviewId: string) => {
  await updateDoc(doc(db, 'reviews', reviewId), { helpfulCount: increment(1) });
  const reviewIndex = reviewsCache.findIndex(r => r.id === reviewId);
  if (reviewIndex !== -1) {
    reviewsCache[reviewIndex].helpfulCount++;
  }
};

export const moderateReview = async (reviewId: string, action: 'approve' | 'reject' | 'flag', adminId: string, note?: string): Promise<boolean> => {
  try {
    const updateData: Partial<Review> = {
      status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
      moderatedBy: adminId,
      moderatedAt: new Date(),
    };
    
    if (note) {
      updateData.moderationNote = note;
    }
    
    await updateDoc(doc(db, 'reviews', reviewId), updateData);
    
    // Update local cache
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
): Promise<AdminReply | null> => {
  try {
    const reply: AdminReply = {
      id: Math.random().toString(36).substr(2, 9),
      adminId,
      adminName,
      adminRole,
      message,
      date: new Date(),
    };
    
    await updateDoc(doc(db, 'reviews', reviewId), {
      adminReplies: arrayUnion(reply)
    });
    
    // Update local cache
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

export const getReviewSummary = (productId: string): ReviewSummary => {
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