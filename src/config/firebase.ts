import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiER-kd23Ffju8VGWLxW8scYvzNHbA9Bw",
  authDomain: "ungservice-cd309.firebaseapp.com",
  projectId: "ungservice-cd309",
  storageBucket: "ungservice-cd309.firebasestorage.app",
  messagingSenderId: "634491024419",
  appId: "1:634491024419:web:57d2f169731d54dfc12d96",
  measurementId: "G-YPSF5K73VB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Initialize messaging (only in browser environment)
let messaging: any = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not available:', error);
  }
}

export { messaging };

// Request notification permission and get token
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'your-vapid-key' // You can add this later if needed
      });
      return token;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
  }
  return null;
};

// Handle foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }
    
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app; 