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
  categories: JobCategory[]; // Changed from single category to array
  jobType: JobType;
  priceType: PriceType;
  requirements: JobRequirements;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  numberOfWorkers: number;
  expectedDuration: number;
  wage: number;
  employerId: string;
  employer: User;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  applicants: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type JobCategory = 
  | 'grass-cutting'           // 🌿 Klippe gress
  | 'weed-removal'           // 🌱 Fjerne ugress
  | 'bark-soil'              // 🪴 Legge bark eller ny jord
  | 'hedge-trimming'         // 🌳 Klippe hekk
  | 'trash-removal'          // 🗑️ Kjøre søppel
  | 'washing'                // 💦 Spyle
  | 'cleaning'               // 🧹 Rengjøre
  | 'window-washing'         // 🪟 Vaske vinduer
  | 'carrying'               // 💪 Bærejobb
  | 'painting'               // 🎨 Male
  | 'staining'               // 🪵 Beise
  | 'repair'                 // 🔧 Reparere
  | 'tidying'                // 📦 Rydde
  | 'car-washing'            // 🚗 Vaske bilen
  | 'snow-shoveling'         // ❄️ Snømåking
  | 'moving-help'            // 📦 Hjelpe med flytting
  | 'salt-sand'              // 🧂 Strø med sand / salt
  | 'pet-sitting'            // 🐕 Dyrepass
  | 'other';                 // ✨ Annet

export type JobType = 'one-time' | 'recurring';

export type PriceType = 'hourly' | 'fixed';

export interface JobRequirements {
  carRequired: boolean;
  equipmentRequired: 'yes' | 'some' | 'no';
}

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