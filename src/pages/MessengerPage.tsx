import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePosts } from '../context/PostContext';
import { useChat } from '../context/ChatContext';
import { useUser } from '../context/UserContext';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SUPPORT_NAMES, SUPPORT_USER_IDS } from '../constants';
import { safeStringify } from '../lib/mapUtils';
import { 
  Search, 
  ArrowRight, 
  Phone, 
  Video, 
  MoreVertical, 
  Send, 
  Paperclip, 
  Mic, 
  Smile,
  Camera,
  Check,
  CheckCheck,
  MessageCircle,
  Plus,
  PhoneCall,
  VideoIcon,
  Settings,
  UserPlus,
  Volume2,
  Trash2,
  Rocket
} from 'lucide-react';

interface MessengerPageProps {
  onClose: () => void;
  initialUser?: {
    id: string | number;
    name: string;
    avatar?: string;
    chatId?: string;
  };
  initialAction?: 'chat' | 'call';
  initialMessage?: string;
}

export default function MessengerPage({ onClose, initialUser, initialAction, initialMessage }: MessengerPageProps) {
  const { stories, addStory } = usePosts();
  const { chats, sendMessage, getOrCreateChat, markAsRead } = useChat();
  const { profiles, activeProfile } = useUser();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'chats' | 'status' | 'calls'>(initialAction === 'call' ? 'calls' : 'chats');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isCalling, setIsCalling] = useState(initialAction === 'call');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState(initialMessage || '');
  const [showToast, setShowToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Handle initial user
  useEffect(() => {
    if (initialUser) {
      if (initialUser.chatId) {
        setActiveChat(initialUser.chatId);
        if (initialAction === 'call') setIsCalling(true);
        if (initialMessage) setInputText(initialMessage);
      } else {
        getOrCreateChat(initialUser.id.toString()).then(chatId => {
          setActiveChat(chatId);
          if (initialAction === 'call') setIsCalling(true);
          if (initialMessage) setInputText(initialMessage);
        });
      }
    }
  }, [initialUser, initialAction, initialMessage]);

  // Listen for messages in active chat
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, 'chats', activeChat, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        time: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          : new Date(doc.data().createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        sender: doc.data().senderId === activeProfile.uid ? 'me' : 'other'
      }));
      setMessages(fetchedMessages);
      markAsRead(activeChat);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${activeChat}/messages`);
    });

    return () => unsubscribe();
  }, [activeChat, activeProfile.uid]);

  const handleSendMessage = async () => {
    console.log('Attempting to send message:', safeStringify({ inputText, activeChat }));
    if (!inputText.trim() || !activeChat) return;
    const text = inputText;
    setInputText('');
    try {
      await sendMessage(activeChat, text);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', safeStringify(error));
      setShowToast('فشل إرسال الرسالة');
    }
  };

  const [filterType, setFilterType] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const chatList = chats.map(chat => {
    const otherParticipantId = chat.participants.find(p => p !== activeProfile.uid);
    const otherParticipant = profiles.find(p => p.uid === otherParticipantId || p.id === otherParticipantId);
    
    const name = SUPPORT_NAMES[otherParticipantId as string] || otherParticipant?.name || 'مستخدم غير معروف';
    const avatar = otherParticipant?.avatar || `https://picsum.photos/seed/${otherParticipantId}/100/100`;

    return {
      ...chat,
      name,
      avatar,
      lastMsg: chat.lastMessage || 'لا توجد رسائل بعد',
      time: chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : '',
      unread: chat.unreadCount?.[activeProfile.uid] || 0
    };
  });

  const filteredChats = chatList.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         chat.lastMsg.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || chat.type === filterType;
    const matchesUnread = !showOnlyUnread || chat.unread > 0;
    return matchesSearch && matchesType && matchesUnread;
  });

  const filterOptions = [
    { id: 'all', label: 'الكل', icon: null },
    { id: 'unread', label: 'غير مقروء', icon: <div className="w-2 h-2 bg-red-500 rounded-full"></div> },
    { id: 'order', label: 'طلبات', icon: null },
    { id: 'delivery', label: 'توصيل', icon: null },
    { id: 'deal', label: 'صفقات', icon: null },
    { id: 'service', label: 'خدمات', icon: null },
  ];

  if (activeChat) {
    const chat = chatList.find(c => c.id === activeChat);
    return (
      <div className="flex flex-col h-full bg-[#fff5f5]">
        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-4 right-4 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
            >
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shrink-0">
                <Rocket size={16} />
              </div>
              <p className="text-xs font-black">{showToast}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calling UI Overlay */}
        <AnimatePresence>
          {isCalling && (
            <motion.div 
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 z-[100] bg-[#991b1b] flex flex-col items-center justify-center p-8 text-white"
            >
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white/20 rounded-full"
                  />
                  <img src={chat?.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white/30 relative z-10" referrerPolicy="no-referrer" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-black">{chat?.name}</h2>
                  <p className="text-white/60 font-bold mt-2 animate-pulse">جاري الاتصال...</p>
                </div>
              </div>
              
              <div className="flex items-center gap-12 mb-12">
                <button 
                  onClick={() => setIsCalling(false)}
                  className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all"
                >
                  <Phone size={28} className="rotate-[135deg]" />
                </button>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <Mic size={28} />
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                  <Volume2 size={28} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messenger Header */}
        <header className="bg-[#991b1b] px-4 py-3 flex items-center justify-between text-white sticky top-0 z-10 shadow-md">
          <div className="flex items-center gap-2">
            <button onClick={() => {
              if (initialUser && activeChat === initialUser.id) {
                onClose();
              } else {
                setActiveChat(null);
              }
            }} className="p-1 hover:bg-white/10 rounded-full">
              <ArrowRight size={24} />
            </button>
            <div className="relative">
              <img src={chat?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-white/20" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-bold leading-tight">{chat?.name || initialUser?.name}</h3>
              <p className="text-[11px] opacity-80">متصل الآن</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowToast('مكالمة الفيديو ستكون متاحة قريباً')}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <Video size={20} />
            </button>
            <button onClick={() => setIsCalling(true)} className="p-1 hover:bg-white/10 rounded-full"><Phone size={20} /></button>
            <button 
              onClick={() => setShowToast('المزيد من الخيارات ستكون متاحة قريباً')}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', opacity: 0.9 }}>
          <div className="flex justify-center mb-4">
            <span className="bg-red-50 px-2 py-0.5 rounded-lg text-[10px] font-medium text-red-600 shadow-sm uppercase">اليوم</span>
          </div>
          
          <div className="flex flex-col gap-1">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative mb-1 ${
                  msg.sender === 'me' 
                    ? 'self-end bg-[#fee2e2] text-gray-800 rounded-tr-none' 
                    : 'self-start bg-white text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="text-[14px] leading-relaxed pr-8">{msg.text}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span className="text-[10px] text-gray-500">{msg.time}</span>
                  {msg.sender === 'me' && <CheckCheck size={14} className="text-red-500" />}
                </div>
                {/* Bubble Tail */}
                <div className={`absolute top-0 w-2 h-2 ${
                  msg.sender === 'me' 
                    ? '-right-1.5 bg-[#fee2e2]' 
                    : '-left-1.5 bg-white'
                }`} style={{ clipPath: msg.sender === 'me' ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-2 bg-[#f9fafb] flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-sm border border-gray-100">
            <button 
              onClick={() => setShowToast('الرموز التعبيرية ستكون متاحة قريباً')}
              className="text-gray-400 hover:text-red-600"
            >
              <Smile size={24} />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="اكتب رسالة" 
              className="flex-1 bg-transparent border-none text-[15px] outline-none py-1" 
            />
            <button 
              onClick={() => setShowToast('إرفاق الملفات سيكون متاحاً قريباً')}
              className="text-gray-400 hover:text-red-600"
            >
              <Paperclip size={22} className="-rotate-45" />
            </button>
            <button 
              onClick={() => setShowToast('الكاميرا ستكون متاحة قريباً')}
              className="text-gray-400 hover:text-red-600"
            >
              <Camera size={22} />
            </button>
          </div>
          <button 
            onClick={handleSendMessage}
            className="bg-[#991b1b] text-white p-2.5 rounded-full shadow-md hover:bg-[#7f1d1d] transition-all active:scale-95 flex items-center justify-center"
          >
            {inputText.trim() ? <Send size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Messenger Main Header */}
      <header className="bg-[#991b1b] px-3 py-2 text-white shadow-md sticky top-0 z-20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
              <ArrowRight size={20} />
            </button>
          </div>
          
          {!showSearch ? (
            <div className="flex flex-1 justify-center gap-4 text-[10px] font-black">
              <button 
                onClick={() => setCurrentTab('chats')}
                className={`py-1 transition-all ${currentTab === 'chats' ? 'border-b-2 border-white' : 'opacity-60'}`}
              >
                الدردشات
              </button>
              <button 
                onClick={() => setCurrentTab('status')}
                className={`py-1 transition-all ${currentTab === 'status' ? 'border-b-2 border-white' : 'opacity-60'}`}
              >
                الحالة
              </button>
              <button 
                onClick={() => setCurrentTab('calls')}
                className={`py-1 transition-all ${currentTab === 'calls' ? 'border-b-2 border-white' : 'opacity-60'}`}
              >
                المكالمات
              </button>
            </div>
          ) : (
            <div className="flex-1 mx-2">
              <input 
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث..."
                className="w-full bg-white/20 text-white placeholder-white/60 rounded-full px-4 py-1 text-sm outline-none border border-white/30"
              />
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) {
                setSearchQuery('');
                setFilterType('all');
                setShowOnlyUnread(false);
              }
            }} className="p-1 hover:bg-white/10 rounded-full">
              <Search size={18} />
            </button>
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-white/10 rounded-full">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Smart Filters UI */}
        {showSearch && currentTab === 'chats' && (
          <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {filterOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (opt.id === 'unread') {
                    setShowOnlyUnread(!showOnlyUnread);
                    setFilterType('all');
                  } else {
                    setFilterType(opt.id);
                    setShowOnlyUnread(false);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                  (opt.id === 'unread' ? showOnlyUnread : filterType === opt.id)
                    ? 'bg-white text-red-700 border-white shadow-sm'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {opt.icon}
                {opt.label}
                {opt.id === 'unread' && chatList.filter(c => c.unread > 0).length > 0 && (
                  <span className="bg-red-600 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px]">
                    {chatList.filter(c => c.unread > 0).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute left-2 top-12 bg-white rounded-lg shadow-xl border border-gray-100 py-2 w-48 z-50 text-gray-800">
            <button className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center justify-between">
              <span className="font-medium">مجموعة جديدة</span>
              <UserPlus size={16} className="text-gray-400" />
            </button>
            <button className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center justify-between">
              <span className="font-medium">كتم التنبيهات</span>
              <Volume2 size={16} className="text-gray-400" />
            </button>
            <button className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 flex items-center justify-between">
              <span className="font-medium">الإعدادات</span>
              <Settings size={16} className="text-gray-400" />
            </button>
            <div className="h-px bg-gray-100 my-1"></div>
            <button className="w-full px-4 py-2 text-right text-sm hover:bg-gray-50 text-red-600 flex items-center justify-between">
              <span className="font-medium">حذف الكل</span>
              <Trash2 size={16} className="text-red-400" />
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {currentTab === 'chats' && (
          <div className="divide-y divide-gray-50">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => setActiveChat(chat.id)}
                  className="px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <img src={chat.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-gray-100" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[16px] font-bold text-gray-900">{chat.name}</h4>
                      <span className={`text-[12px] ${chat.unread > 0 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[14px] text-gray-500 truncate max-w-[200px]">{chat.lastMsg}</p>
                      {chat.unread > 0 && (
                        <div className="bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-sm">لا توجد نتائج تطابق بحثك</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'status' && (
          <div className="p-4 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">حالاتك</h3>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer" onClick={() => {
                  addStory({
                    userId: 'me',
                    userName: 'حالتك',
                    avatar: 'https://picsum.photos/seed/user/100/100',
                    time: 'الآن',
                    isMine: true
                  });
                }}>
                  <img src="https://picsum.photos/seed/user/100/100" className="w-14 h-14 rounded-full border-2 border-gray-200 p-0.5" referrerPolicy="no-referrer" />
                  <div className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-0.5 border-2 border-white">
                    <Plus size={14} />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">حالتك</h4>
                  <p className="text-xs text-gray-500">اضغط للإضافة</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">التحديثات الأخيرة</h3>
              <div className="space-y-4">
                {stories.filter(s => !s.isMine).map(status => (
                  <div key={status.id} className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                    <div className="w-14 h-14 rounded-full border-2 border-red-500 p-0.5">
                      <img src={status.avatar} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{status.userName}</h4>
                      <p className="text-xs text-gray-500">{status.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'calls' && (
          <div className="divide-y divide-gray-50">
            {/* Mock calls for now */}
            {[].map((call: any) => (
              <div key={call.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-4">
                  <img src={call.avatar} className="w-14 h-14 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-gray-900">{call.name}</h4>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${call.type === 'missed' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <p className="text-xs text-gray-500">{call.time}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-red-600">
                  {call.video ? <VideoIcon size={20} /> : <PhoneCall size={20} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowSearch(true)}
        className="absolute bottom-6 left-6 bg-red-600 text-white p-3 rounded-full shadow-xl hover:bg-red-700 transition-all active:scale-95 z-10"
      >
        {currentTab === 'chats' && <MessageCircle size={20} />}
        {currentTab === 'status' && <Camera size={20} />}
        {currentTab === 'calls' && <PhoneCall size={20} />}
      </button>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
}
