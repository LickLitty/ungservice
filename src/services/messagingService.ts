import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDoc,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message, Conversation, User } from '../types';

export class MessagingService {
  // Create a new conversation
  static async createConversation(participants: string[]): Promise<string> {
    const conversationData = {
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  }

  // Get or create conversation between two users
  static async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    // Check if conversation already exists
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);
    let existingConversationId: string | null = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(userId2)) {
        existingConversationId = doc.id;
      }
    });

    if (existingConversationId) {
      return existingConversationId;
    }

    // Create new conversation
    return await this.createConversation([userId1, userId2]);
  }

  // Send a message
  static async sendMessage(conversationId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const messageData = {
      ...message,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'messages'), messageData);
    
    // Update conversation's last message and timestamp
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: message.content,
      lastMessageTime: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  // Subscribe to conversations for a user
  static subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void) {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, async (snapshot) => {
      const conversations: Conversation[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const otherParticipantId = data.participants.find((id: string) => id !== userId);
        
        // Get other participant's user data
        let otherUser: User | null = null;
        if (otherParticipantId) {
          try {
            const userDocRef = doc(db, 'users', otherParticipantId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              otherUser = userDoc.data() as User;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }

        conversations.push({
          id: docSnapshot.id,
          participants: data.participants,
          lastMessage: data.lastMessage || null,
          lastMessageTime: data.lastMessageTime?.toDate() || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          otherUser, // Add the other user's data
        } as Conversation);
      }
      
      callback(conversations);
    });
  }

  // Subscribe to messages for a conversation
  static subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, async (snapshot) => {
      const messages: Message[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        
        // Get sender's user data
        let sender: User | null = null;
        if (data.senderId) {
          try {
            const userDocRef = doc(db, 'users', data.senderId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              sender = userDoc.data() as User;
            }
          } catch (error) {
            console.error('Error fetching sender data:', error);
          }
        }

        messages.push({
          id: docSnapshot.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          sender,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          isRead: data.isRead || false,
        } as Message);
      }
      
      callback(messages);
    });
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('senderId', '!=', userId),
      where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(batch);
  }

  // Get user data by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      if (!userId) {
        console.error('No user ID provided');
        return null;
      }
      
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userDoc.id,
          email: userData.email || '',
          displayName: userData.displayName || 'Ukjent bruker',
          photoURL: userData.photoURL,
          role: userData.role || 'worker',
          bio: userData.bio,
          phone: userData.phone,
          age: userData.age,
          address: userData.address,
          city: userData.city,
          experience: userData.experience,
          skills: userData.skills || [],
          location: userData.location,
          rating: userData.rating || 0,
          completedJobs: userData.completedJobs || 0,
          createdAt: userData.createdAt?.toDate() || new Date(),
          isEmailVerified: userData.isEmailVerified || false,
        } as User;
      }
      
      console.warn('User not found:', userId);
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
} 