import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaPhoneAlt, FaVideo, FaImage, FaInfoCircle, FaPaperPlane } from 'react-icons/fa';
import { BsTelephone, BsCameraVideo, BsInfoCircle } from 'react-icons/bs';
import { IoIosSend } from "react-icons/io";
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import './ChatPage.css';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const socketRef = useRef();
    const scrollRef = useRef();
    const navigate = useNavigate();
    const location = useLocation(); // To handle navigation state if needed

    const isLocalhost = window.location.hostname === "localhost";
    const API_BASE = isLocalhost
        ? process.env.REACT_APP_API_URL
        : process.env.REACT_APP_API_URL_LAN;

    // 1. Initialize User & Socket
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!token || !userId) {
                navigate('/login');
                return;
            }
            // Decode simple info or fetch full profile if needed
            setCurrentUser({ ma_nguoi_dung: userId }); 
        };
        fetchUser();

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        if (token && userId) {
            socketRef.current = io(API_BASE, {
                query: { userId },
                transports: ['websocket']
            });

            socketRef.current.on('newChatMessage', (message) => {
                // Update messages if looking at this chat
                // Use functional update to access latest currentChat state
                setMessages(prev => {
                     // We can't easily access currentChat inside this closure without ref or functional update logic check
                     // But simpler: just update message list logic is below in a separate effect or combined logic
                     return prev; // Placeholder, real logic in handleIncomingMessage
                });
                
                handleIncomingMessage(message);
            });
        }

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [API_BASE, navigate]);

    // Helper to handle incoming socket message
    const handleIncomingMessage = (message) => {
        setMessages(prev => {
            // Check if this message belongs to the current open chat
            // message.sender.ma_nguoi_dung OR message.receiver.ma_nguoi_dung
            // But 'currentChat' state is tricky in callbacks.
            // We'll rely on a ref or the fact that this function is recreated if we include it in dependency (but we didn't).
            // Actually, best way is to use a ref for currentChatId
            return prev; // See useEffect below
        });
        
        // Refresh conversations list to update preview and order
        fetchConversations();
    };
    
    // We need a Ref for currentChat to use inside socket listener closure
    const currentChatRef = useRef(null);
    useEffect(() => {
        currentChatRef.current = currentChat;
    }, [currentChat]);

    // Re-attach listener to close over currentChatRef properly or handle logic differently?
    // Better: Use a single useEffect for socket that calls a handler which reads the ref.
    useEffect(() => {
        if (!socketRef.current) return;
        
        const handler = (message) => {
            const activeChat = currentChatRef.current;
            const isRelated = activeChat && (
                message.sender.ma_nguoi_dung === activeChat.partner.ma_nguoi_dung ||
                message.receiver.ma_nguoi_dung === activeChat.partner.ma_nguoi_dung
            );

            if (isRelated) {
                setMessages(prev => [...prev, message]);
                // If it's incoming, mark as read immediately? Or wait for focus?
                // For simplicity, we can assume if open, it's read.
                if (message.sender.ma_nguoi_dung === activeChat.partner.ma_nguoi_dung) {
                    // Call API to mark read (debounced or immediate)
                    // For now, let's just leave it visually "unread" until refresh or explicit action, 
                    // but usually you want to clear the dot.
                }
            }
            
            // Always update conversation list (reorder/preview)
            // Ideally we modify state locally, but fetching is safer for sync
            fetchConversations(); 
        };

        socketRef.current.off('newChatMessage');
        socketRef.current.on('newChatMessage', handler);
        
        return () => {
            socketRef.current?.off('newChatMessage', handler);
        };
    }, [currentChat]); // Re-bind when currentChat changes is okay for this scale


    // 2. Fetch Conversations
    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(res.data);
            setIsLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [API_BASE]);

    // 3. Fetch Messages for specific chat
    useEffect(() => {
        if (!currentChat) return;

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE}/api/chat/messages/${currentChat.partner.ma_nguoi_dung}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(res.data);
                
                // Mark as read
                await axios.put(`${API_BASE}/api/chat/read`, { partnerId: currentChat.partner.ma_nguoi_dung }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                // Refresh conversations to clear badge locally if needed
                fetchConversations();
                
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [currentChat, API_BASE]);

    // 4. Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // 5. Send Message
    // Better Send Handler:
    const handleSendClean = async () => {
         if (!newMessage.trim() || !currentChat) return;
         const content = newMessage;
         setNewMessage(""); // Clear input immediately
         
         try {
             const token = localStorage.getItem('token');
             await axios.post(`${API_BASE}/api/chat/send`, 
                { receiverId: currentChat.partner.ma_nguoi_dung, content }, 
                { headers: { Authorization: `Bearer ${token}` }}
             );
             // The socket event will arrive and add the message to the list.
         } catch (err) {
             console.error("Failed to send", err);
             // Restore input if failed?
             setNewMessage(content); 
         }
    };


    return (
        <div className="bg-white min-h-screen flex flex-col">
            <Header />
            
            <div className="chat-page">
                {/* SIDEBAR */}
                <div className="chat-sidebar">
                    <div className="chat-search">
                        <input type="text" placeholder="Tìm kiếm" />
                    </div>
                    
                    <div className="conversation-list">
                        {conversations.map(conv => (
                            <div 
                                key={conv.partner.ma_nguoi_dung} 
                                className={`conversation-item ${currentChat?.partner?.ma_nguoi_dung === conv.partner.ma_nguoi_dung ? 'active' : ''}`}
                                onClick={() => setCurrentChat(conv)}
                            >
                                <img src={conv.partner.anh_dai_dien || defaultAvatar} alt="avatar" />
                                <div className="conversation-info">
                                    <div className="conversation-name">{conv.partner.ten_hien_thi}</div>
                                    <div className={`conversation-preview ${conv.lastMessage && !conv.lastMessage.da_doc && conv.lastMessage.sender?.ma_nguoi_dung !== currentUser?.ma_nguoi_dung ? 'unread' : ''}`}>
                                        {conv.lastMessage ? (
                                            <>
                                                {conv.lastMessage.sender?.ma_nguoi_dung === currentUser?.ma_nguoi_dung ? 'You: ' : ''}
                                                {conv.lastMessage.noi_dung}
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">Bắt đầu trò chuyện</span>
                                        )}
                                    </div>
                                </div>
                                {/* Logic for unread dot: The conversation object needs to know if there are unread messages.
                                    The current backend getConversations doesn't return count, but we can infer from last message read status?
                                    Actually, if last message is unread and I am receiver, show dot.
                                    Better to have a real count. For now, use last message status as proxy.
                                */}
                                {/* {conv.unreadCount > 0 && <div className="unread-dot"></div>} */}
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-3 border-t border-gray-200">
                        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-black py-2 rounded-full font-medium transition-colors">
                            <span className="text-2xl">+</span> Tạo nhóm chat
                        </button>
                    </div>
                </div>

                {/* CHAT WINDOW */}
                {currentChat ? (
                    <div className="chat-window">
                        {/* Chat Header */}
                        <div className="chat-header">
                            <div className="chat-header-user">
                                <img src={currentChat.partner.anh_dai_dien || defaultAvatar} alt="avatar" />
                                <div className="chat-header-name">{currentChat.partner.ten_hien_thi}</div>
                            </div>
                            <div className="chat-header-actions">
                                <BsTelephone className="chat-header-icon" title="Call (Demo)" />
                                <BsCameraVideo className="chat-header-icon" title="Video Call (Demo)" />
                                <BsInfoCircle className="chat-header-icon" title="Info" />
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="chat-messages">
                            {messages.map((msg, index) => {
                                // Logic to determine if it's "Me" or "Friend"
                                // The message object structure from API: { senderId: "...", ... } or { sender: { ma_nguoi_dung: "..." } }
                                // From getMessages API: senderId is at root level.
                                // From socket: sender is object.
                                // Need to unify.
                                const msgSenderId = msg.senderId || msg.sender?.ma_nguoi_dung;
                                const isOwn = msgSenderId === currentUser?.ma_nguoi_dung;
                                
                                return (
                                    <div key={msg.id || index} className={`message ${isOwn ? 'own' : 'friend'}`}>
                                        {!isOwn && (
                                            <img 
                                                src={currentChat.partner.anh_dai_dien || defaultAvatar} 
                                                className="message-avatar" 
                                                alt="avatar" 
                                            />
                                        )}
                                        <div className="message-bubble" title={new Date(msg.tao_luc).toLocaleString()}>
                                            {msg.noi_dung}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="chat-input-area">
                             {/* Extra icons like image upload could go here */}
                             <div className="text-blue-500 text-xl cursor-pointer"><FaImage /></div>
                            <input 
                                type="text" 
                                className="chat-input" 
                                placeholder="Message..." 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendClean()}
                            />
                            <button className="send-btn" onClick={handleSendClean}>
                                <IoIosSend />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="empty-chat-state">
                        Select a conversation to start chatting
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
