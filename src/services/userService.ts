import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from '../types';

export class UserService {
  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          email: data.email || '',
          displayName: data.displayName || 'Ukjent bruker',
          photoURL: data.photoURL,
          role: data.role || 'worker',
          bio: data.bio,
          phone: data.phone,
          age: data.age,
          address: data.address,
          city: data.city,
          experience: data.experience,
          skills: data.skills || [],
          location: data.location,
          rating: data.rating || 0,
          completedJobs: data.completedJobs || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          isEmailVerified: data.isEmailVerified || false,
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }
} 