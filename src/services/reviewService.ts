import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Review, User, Job } from '../types';

export class ReviewService {
  // Create a new review
  static async createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'reviews'), {
      ...review,
      createdAt: serverTimestamp(),
    });

    // Update user's average rating
    await this.updateUserRating(review.revieweeId);

    return docRef.id;
  }

  // Get reviews for a specific user
  static subscribeToUserReviews(userId: string, callback: (reviews: Review[]) => void) {
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const reviews: Review[] = [];
      snapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Review);
      });
      callback(reviews);
    });
  }

  // Get reviews for a specific job
  static async getJobReviews(jobId: string): Promise<Review[]> {
    const q = query(
      collection(db, 'reviews'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const reviews: Review[] = [];
    snapshot.forEach((doc) => {
      reviews.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      } as Review);
    });

    return reviews;
  }

  // Calculate and update user's average rating
  static async updateUserRating(userId: string): Promise<void> {
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let totalRating = 0;
    let reviewCount = 0;

    snapshot.forEach((doc) => {
      const review = doc.data() as Review;
      totalRating += review.rating;
      reviewCount++;
    });

    const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

    // Update user document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      completedJobs: reviewCount,
    });
  }

  // Get user's review statistics
  static async getUserReviewStats(userId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId)
    );

    const snapshot = await getDocs(q);
    let totalRating = 0;
    let reviewCount = 0;
    const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    snapshot.forEach((doc) => {
      const review = doc.data() as Review;
      totalRating += review.rating;
      reviewCount++;
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating: reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 0,
      totalReviews: reviewCount,
      ratingDistribution,
    };
  }

  // Check if user has already reviewed a specific job
  static async hasUserReviewedJob(userId: string, jobId: string): Promise<boolean> {
    const q = query(
      collection(db, 'reviews'),
      where('reviewerId', '==', userId),
      where('jobId', '==', jobId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // Get recent reviews for a user (for profile display)
  static async getRecentUserReviews(userId: string, limit: number = 5): Promise<Review[]> {
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const reviews: Review[] = [];
    snapshot.forEach((doc) => {
      if (reviews.length < limit) {
        reviews.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Review);
      }
    });

    return reviews;
  }
} 