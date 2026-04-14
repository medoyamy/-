import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc,
  updateDoc,
  Timestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useUser } from './UserContext';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  mediaUrl?: string;
  createdAt: string;
  readBy: string[];
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: Record<string, number>;
  type: 'direct' | 'group' | 'order' | 'deal';
  metadata?: any;
}

interface ChatContextType {
  chats: Chat[];
  messages: Record<string, Message[]>;
  sendMessage: (chatId: string, text: string, type?: Message['type'], mediaUrl?: string) => Promise<void>;
  getOrCreateChat: (participantId: string, type?: Chat['type']) => Promise<string>;
  markAsRead: (chatId: string) => Promise<void>;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userMode } = useUser();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setChats([]);
      setLoading(false);
      return;
    }

    const q = userMode === 'admin' 
      ? query(collection(db, 'chats'), orderBy('lastMessageTime', 'desc'))
      : query(
          collection(db, 'chats'), 
          where('participants', 'array-contains', auth.currentUser.uid),
          orderBy('lastMessageTime', 'desc')
        );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        lastMessageTime: doc.data().lastMessageTime instanceof Timestamp 
          ? doc.data().lastMessageTime.toDate().toISOString() 
          : doc.data().lastMessageTime
      } as Chat));
      setChats(fetchedChats);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const sendMessage = async (chatId: string, text: string, type: Message['type'] = 'text', mediaUrl?: string) => {
    if (!auth.currentUser) return;

    const messageData: Omit<Message, 'id'> = {
      chatId,
      senderId: auth.currentUser.uid,
      text,
      type,
      mediaUrl,
      createdAt: new Date().toISOString(),
      readBy: [auth.currentUser.uid]
    };

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, messageData);

      // Update chat last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: text,
        lastMessageTime: messageData.createdAt,
        // Increment unread count for other participants
        // This is a bit complex in rules, but simplified here
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}/messages`);
    }
  };

  const getOrCreateChat = async (participantId: string, type: Chat['type'] = 'direct'): Promise<string> => {
    if (!auth.currentUser) throw new Error('User not authenticated');

    // Check if direct chat already exists
    if (type === 'direct') {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', auth.currentUser.uid),
        where('type', '==', 'direct')
      );
      
      try {
        const snapshot = await getDocs(q);
        const existingChat = snapshot.docs.find(doc => 
          doc.data().participants.includes(participantId)
        );

        if (existingChat) return existingChat.id;
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'chats');
      }
    }

    // Create new chat
    const chatId = Math.random().toString(36).substr(2, 9);
    const newChat: Chat = {
      id: chatId,
      participants: [auth.currentUser.uid, participantId],
      type,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: {
        [auth.currentUser.uid]: 0,
        [participantId]: 0
      }
    };

    await setDoc(doc(db, 'chats', chatId), newChat);
    return chatId;
  };

  const markAsRead = async (chatId: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        [`unreadCount.${auth.currentUser.uid}`]: 0
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${chatId}`);
    }
  };

  return (
    <ChatContext.Provider value={{ 
      chats, 
      messages, 
      sendMessage, 
      getOrCreateChat, 
      markAsRead, 
      loading 
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
