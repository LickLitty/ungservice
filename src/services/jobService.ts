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
    try {
      console.log('JobService.createJob called with data:', jobData);
      
      // Validate required fields before saving
      if (!jobData.title || !jobData.description || !jobData.categories) {
        throw new Error('Missing required fields: title, description, or categories');
      }
      
      const jobToSave = {
        ...jobData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('Job data to save:', jobToSave);
      
      const docRef = await addDoc(collection(db, 'jobs'), jobToSave);
      
      console.log('Job created successfully with ID:', docRef.id);
      
      // Verify the job was saved by fetching it back
      const savedJob = await getDoc(docRef);
      console.log('Saved job data:', savedJob.data());
      
      return docRef.id;
    } catch (error) {
      console.error('Error in JobService.createJob:', error);
      throw error;
    }
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
    try {
      console.log('Setting up job subscription...');
      const q = query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        console.log('Job snapshot received:', snapshot.size, 'jobs');
        console.log('Snapshot changes:', snapshot.docChanges().map(change => ({
          type: change.type,
          docId: change.doc.id,
          data: change.doc.data()
        })));
        
        const jobs: Job[] = [];
        snapshot.forEach((doc) => {
          try {
            const data = doc.data();
            console.log('Processing job document:', doc.id, data);
            console.log('Job status:', data.status);
            
            // Validate required fields
            if (!data.title || !data.description || !data.categories) {
              console.warn('Job document missing required fields:', doc.id, data);
              return; // Skip this job
            }
            
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
          } catch (docError) {
            console.error('Error processing job document:', doc.id, docError);
          }
        });
        console.log('Processed jobs:', jobs.length);
        console.log('Jobs statuses:', jobs.map(job => ({ id: job.id, status: job.status, title: job.title })));
        callback(jobs);
      }, (error) => {
        console.error('Error in job subscription:', error);
        callback([]); // Return empty array on error
      });
    } catch (error) {
      console.error('Error setting up job subscription:', error);
      callback([]); // Return empty array on error
      return () => {}; // Return empty unsubscribe function
    }
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

  // Get a specific job by ID
  static async getJobById(jobId: string): Promise<Job> {
    try {
      console.log('Getting job by ID:', jobId);
      
      if (!jobId) {
        throw new Error('Job ID is required');
      }
      
      const jobDoc = await getDoc(doc(db, 'jobs', jobId));
      
      console.log('Job document exists:', jobDoc.exists());
      
      if (!jobDoc.exists()) {
        console.log('Job document does not exist for ID:', jobId);
        throw new Error('Job not found');
      }
      
      const data = jobDoc.data();
      console.log('Job data retrieved:', data);
      
      // Validate required fields
      if (!data.title || !data.description || !data.categories) {
        console.error('Job data missing required fields:', data);
        throw new Error('Job data is incomplete');
      }
      
      const job: Job = {
        id: jobDoc.id,
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
      };
      
      console.log('Processed job:', job);
      return job;
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
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