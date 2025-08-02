import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db, requestNotificationPermission } from '../config/firebase';
import { Notification } from '../types';

export class NotificationService {
  // Request notification permission and get token
  static async requestPermission(): Promise<string | null> {
    return await requestNotificationPermission();
  }

  // Create a new notification
  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notification,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // Get notifications for a user
  static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        } as Notification);
      });
      callback(notifications);
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(batch);
  }

  // Get unread notification count
  static async getUnreadCount(userId: string): Promise<number> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Create notification for new message
  static async notifyNewMessage(
    recipientId: string, 
    senderName: string, 
    messagePreview: string,
    conversationId: string
  ): Promise<void> {
    await this.createNotification({
      userId: recipientId,
      type: 'new-message',
      title: `Ny melding fra ${senderName}`,
      message: messagePreview,
      data: { conversationId },
      isRead: false,
    });
  }

  // Create notification for job application
  static async notifyJobApplication(
    employerId: string,
    workerName: string,
    jobTitle: string,
    jobId: string
  ): Promise<void> {
    await this.createNotification({
      userId: employerId,
      type: 'job-request',
      title: `Ny søknad på "${jobTitle}"`,
      message: `${workerName} har søkt på jobben din`,
      data: { jobId, workerName },
      isRead: false,
    });
  }

  // Create notification for application status change
  static async notifyApplicationStatus(
    workerId: string,
    jobTitle: string,
    status: 'accepted' | 'rejected',
    jobId: string
  ): Promise<void> {
    const type = status === 'accepted' ? 'application-accepted' : 'application-rejected';
    const title = status === 'accepted' 
      ? `Søknad godkjent!` 
      : `Søknad ikke godkjent`;
    const message = status === 'accepted'
      ? `Din søknad på "${jobTitle}" ble godkjent!`
      : `Din søknad på "${jobTitle}" ble ikke godkjent.`;

    await this.createNotification({
      userId: workerId,
      type,
      title,
      message,
      data: { jobId, status },
      isRead: false,
    });
  }

  // Create notification for job reminder
  static async notifyJobReminder(
    userId: string,
    jobTitle: string,
    jobDate: Date,
    jobId: string
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: 'job-reminder',
      title: `Påminnelse: ${jobTitle}`,
      message: `Jobben starter om 1 time (${jobDate.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })})`,
      data: { jobId, jobDate },
      isRead: false,
    });
  }
} 