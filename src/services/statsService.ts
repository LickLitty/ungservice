import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Job } from '../types';

export interface Stats {
  activeJobs: number;
  registeredUsers: number;
  completedJobs: number;
  averageRating: number;
}

export class StatsService {
  static async getStats(): Promise<Stats> {
    try {
      // Get active jobs count
      const activeJobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'open')
      );
      const activeJobsSnapshot = await getCountFromServer(activeJobsQuery);
      const activeJobs = activeJobsSnapshot.data().count;

      // Get registered users count
      const usersSnapshot = await getCountFromServer(collection(db, 'users'));
      const registeredUsers = usersSnapshot.data().count;

      // Get completed jobs count
      const completedJobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'completed')
      );
      const completedJobsSnapshot = await getCountFromServer(completedJobsQuery);
      const completedJobs = completedJobsSnapshot.data().count;

      // Calculate average rating
      const usersQuery = query(collection(db, 'users'));
      const usersDocs = await getDocs(usersQuery);
      let totalRating = 0;
      let usersWithRating = 0;

      usersDocs.forEach((doc) => {
        const userData = doc.data();
        if (userData.rating && userData.rating > 0) {
          totalRating += userData.rating;
          usersWithRating++;
        }
      });

      const averageRating = usersWithRating > 0 ? Math.round((totalRating / usersWithRating) * 10) / 10 : 0;

      return {
        activeJobs,
        registeredUsers,
        completedJobs,
        averageRating
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return default values if there's an error
      return {
        activeJobs: 0,
        registeredUsers: 0,
        completedJobs: 0,
        averageRating: 0
      };
    }
  }
} 