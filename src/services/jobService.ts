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
import { Job, JobApplication, User } from '../types';
import { NotificationService } from './notificationService';

export class JobService {
  // Create a new job
  static async createJob(jobData: Omit<Job, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // Apply for a job
  static async applyForJob(jobId: string, workerId: string, message?: string): Promise<string> {
    // Get job details
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      throw new Error('Job not found');
    }
    
    const job = jobDoc.data() as Job;
    
    // Get worker details
    const workerDoc = await getDoc(doc(db, 'users', workerId));
    if (!workerDoc.exists()) {
      throw new Error('Worker not found');
    }
    
    const worker = workerDoc.data() as User;

    // Create application
    const applicationData: Omit<JobApplication, 'id' | 'createdAt'> = {
      jobId,
      workerId,
      worker,
      status: 'pending',
      message: message || '',
    };

    const docRef = await addDoc(collection(db, 'jobApplications'), {
      ...applicationData,
      createdAt: serverTimestamp(),
    });

    // Send notification to employer
    await NotificationService.notifyJobApplication(
      job.employerId,
      worker.displayName,
      job.title,
      jobId
    );

    return docRef.id;
  }

  // Get applications for a job
  static subscribeToJobApplications(jobId: string, callback: (applications: JobApplication[]) => void) {
    const q = query(
      collection(db, 'jobApplications'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const applications: JobApplication[] = [];
      snapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as JobApplication);
      });
      callback(applications);
    });
  }

  // Get applications by a worker
  static subscribeToWorkerApplications(workerId: string, callback: (applications: JobApplication[]) => void) {
    const q = query(
      collection(db, 'jobApplications'),
      where('workerId', '==', workerId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const applications: JobApplication[] = [];
      snapshot.forEach((doc) => {
        applications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as JobApplication);
      });
      callback(applications);
    });
  }

  // Subscribe to all jobs
  static subscribeToJobs(callback: (jobs: Job[]) => void) {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const jobs: Job[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        jobs.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          categories: data.categories,
          jobType: data.jobType,
          priceType: data.priceType,
          requirements: data.requirements,
          location: data.location,
          numberOfWorkers: data.numberOfWorkers,
          expectedDuration: data.expectedDuration,
          wage: data.wage,
          employerId: data.employerId,
          employer: data.employer,
          status: data.status,
          applicants: data.applicants || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Job);
      });
      callback(jobs);
    });
  }

  // Accept or reject an application
  static async updateApplicationStatus(
    applicationId: string, 
    status: 'accepted' | 'rejected'
  ): Promise<void> {
    const applicationDoc = await getDoc(doc(db, 'jobApplications', applicationId));
    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }

    const application = applicationDoc.data() as JobApplication;
    
    // Update application status
    await updateDoc(doc(db, 'jobApplications', applicationId), {
      status,
      updatedAt: serverTimestamp(),
    });

    // Get job details for notification
    const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
    if (jobDoc.exists()) {
      const job = jobDoc.data() as Job;
      
      // Send notification to worker
      await NotificationService.notifyApplicationStatus(
        application.workerId,
        job.title,
        status,
        application.jobId
      );

      // If accepted, update job status and assign worker
      if (status === 'accepted') {
        await updateDoc(doc(db, 'jobs', application.jobId), {
          status: 'in-progress',
          assignedWorker: application.workerId,
          updatedAt: serverTimestamp(),
        });
      }
    }
  }

  // Check if user has already applied for a job
  static async hasUserApplied(jobId: string, workerId: string): Promise<boolean> {
    const q = query(
      collection(db, 'jobApplications'),
      where('jobId', '==', jobId),
      where('workerId', '==', workerId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  // Get application status for a user and job
  static async getApplicationStatus(jobId: string, workerId: string): Promise<'pending' | 'accepted' | 'rejected' | null> {
    const q = query(
      collection(db, 'jobApplications'),
      where('jobId', '==', jobId),
      where('workerId', '==', workerId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const application = snapshot.docs[0].data() as JobApplication;
    return application.status;
  }

  // Get completed jobs for a user
  static async getCompletedJobs(userId: string): Promise<Job[]> {
    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'completed'),
      where('assignedWorker', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const jobs: Job[] = [];
    snapshot.forEach((doc) => {
      jobs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        date: doc.data().date?.toDate() || new Date(),
      } as Job);
    });

    return jobs;
  }

  // Mark job as completed
  static async markJobAsCompleted(jobId: string): Promise<void> {
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  }
} 