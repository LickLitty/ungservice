export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'employer' | 'worker';
  bio?: string;
  phone?: string;
  age?: number;
  address?: string;
  city?: string;
  experience?: string;
  skills?: string[];
  location?: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  rating: number;
  completedJobs: number;
  createdAt: Date;
  isEmailVerified: boolean;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: JobCategory;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  date: Date;
  duration: number; // in hours
  wage: number; // per hour
  employerId: string;
  employer: User;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: string[]; // user IDs
  assignedWorker?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobCategory = 
  | 'grass-cutting'
  | 'snow-shoveling'
  | 'gardening'
  | 'cleaning'
  | 'painting'
  | 'moving'
  | 'other';

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  worker: User;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // user IDs
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job-request' | 'application-accepted' | 'application-rejected' | 'new-message' | 'job-reminder';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  reviewee: User;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: Date;
} 