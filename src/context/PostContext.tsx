import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  deleteDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { safeStringify } from '../lib/mapUtils';
import { asyncStorage } from '../lib/storage';

export type PostStatus = 'pending' | 'active' | 'rejected' | 'expired';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  imageUrl?: string;
  videoUrl?: string;
  time: string;
  isMine?: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: string;
  content: string;
  category: string;
  source: string;
  contactMethod: string;
  status: PostStatus;
  rejectionReason?: string;
  city?: string;
  region?: string;
  image?: string;
  video?: string;
  type?: 'offer' | 'request' | 'deals' | 'group' | 'friend_activity' | 'quick_offer' | 'special_interest' | 'restaurants' | 'driver_passengers' | 'reel';
  taggedFriends?: string[];
  sharedBy?: string[];
  createdAt: string;
  boosts: string[];
  lat?: number;
  lng?: number;
  title?: string;
  offerType?: string;
  price?: number;
  storeAddress?: string;
  goToStore?: boolean;
  budget?: string;
  duration?: string;
  pickup?: string;
  pickupCoords?: { lat: number; lng: number } | null;
  delivery?: string;
  deliveryCoords?: { lat: number; lng: number } | null;
  // Job specific fields
  jobType?: 'offer' | 'request';
  companyName?: string;
  companyType?: string;
  companyAddress?: string;
  jobTitle?: string;
  requiredQualifications?: string;
  requiredTasks?: string;
  shift?: string;
  ageRange?: string;
  experience?: string;
  salaryRange?: string;
  applicantProfession?: string;
  desiredLocation?: string;
  applicantFeatures?: string;
  applicantTasks?: string;
  applicantAge?: string;
  likes?: string[];
  comments?: Comment[];
}

interface PostContextType {
  posts: Post[];
  stories: Story[];
  addPost: (post: Omit<Post, 'id' | 'authorId' | 'status' | 'createdAt'>) => Promise<void>;
  addStory: (story: Omit<Story, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (id: string, updates: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  approvePost: (id: string) => Promise<void>;
  rejectPost: (id: string, reason: string) => Promise<void>;
  sharePost: (id: string, userName: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  commentPost: (postId: string, userId: string, userName: string, content: string) => Promise<void>;
  loading: boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Load initial data from AsyncStorage (IndexedDB)
    const loadCache = async () => {
      const cachedPosts = await asyncStorage.get<Post[]>('cached_posts');
      const cachedStories = await asyncStorage.get<Story[]>('cached_stories');
      if (cachedPosts) setPosts(cachedPosts);
      if (cachedStories) setStories(cachedStories);
    };
    loadCache();

    // 1. Posts are public, but we filter by status for normal users
    let unsubscribe: (() => void) | null = null;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribe) unsubscribe();
      
      const isAdminEmail = user && (user.email === 'mo7amdevo@gmail.com' || user.email === 'mo7amedevo@gmail.com');
      
      const q = isAdminEmail
        ? query(collection(db, 'posts'), orderBy('createdAt', 'desc'))
        : query(collection(db, 'posts'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
          } as Post;
        });
        setPosts(fetchedPosts);
        asyncStorage.set('cached_posts', fetchedPosts);
        setLoading(false);
      }, (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'posts');
      });

      // 2. Stories require authentication
      let unsubscribeStories: (() => void) | null = null;
      if (user) {
        const qStories = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
        unsubscribeStories = onSnapshot(qStories, (snapshot) => {
          const fetchedStories = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt
            } as Story;
          });
          if (fetchedStories.length > 0) {
            setStories(fetchedStories);
            asyncStorage.set('cached_stories', fetchedStories);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'stories');
        });
      } else {
        setStories([]);
      }

      return () => {
        if (unsubscribe) unsubscribe();
        if (unsubscribeStories) unsubscribeStories();
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const addStory = async (storyData: Omit<Story, 'id' | 'createdAt'>) => {
    try {
      const id = Date.now().toString();
      const newStory = {
        ...storyData,
        id,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'stories', id), newStory);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'stories');
    }
  };

  const addPost = async (postData: Omit<Post, 'id' | 'authorId' | 'status' | 'createdAt'>) => {
    if (!auth.currentUser) return;
    const id = Math.random().toString(36).substr(2, 9);
    const newPost: Post = {
      ...postData,
      id,
      authorId: auth.currentUser.uid,
      status: 'pending', // Default to pending for moderation
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'posts', id), newPost);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${id}`);
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    try {
      await updateDoc(doc(db, 'posts', id), { ...updates, status: 'pending' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `posts/${id}`);
    }
  };

  const approvePost = async (id: string) => {
    try {
      await updateDoc(doc(db, 'posts', id), { status: 'active', rejectionReason: null });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const rejectPost = async (id: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'posts', id), { status: 'rejected', rejectionReason: reason });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
    }
  };

  const sharePost = async (id: string, userName: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const sharedBy = post.sharedBy || [];
    if (!sharedBy.includes(userName)) {
      try {
        await updateDoc(doc(db, 'posts', id), {
          sharedBy: [...sharedBy, userName]
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `posts/${id}`);
      }
    }
  };

  const likePost = async (postId: string, userId: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const likes = post.likes || [];
      const newLikes = likes.includes(userId)
        ? likes.filter(id => id !== userId)
        : [...likes, userId];

      await updateDoc(postRef, { likes: newLikes });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const commentPost = async (postId: string, userId: string, userName: string, content: string) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        userName,
        content,
        createdAt: new Date().toISOString()
      };

      const comments = post.comments || [];
      await updateDoc(postRef, {
        comments: [...comments, newComment]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      stories,
      addPost, 
      addStory,
      updatePost, 
      deletePost, 
      approvePost, 
      rejectPost, 
      sharePost, 
      likePost, 
      commentPost, 
      loading 
    }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
