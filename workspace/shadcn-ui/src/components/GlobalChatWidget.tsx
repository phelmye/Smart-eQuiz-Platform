import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  unread?: boolean;
}

/**
 * Global Chat Widget - Persistent across all pages
 * 
 * Features:
 * - Floating chat button (bottom-right corner)
 * - Online/offline status indicator
 * - Unread message counter badge
 * - Minimizable chat window
 * - Message persistence in localStorage
 * - Cross-page notifications
 * 
 * Usage: Add <GlobalChatWidget /> to your main App/Layout component
 */
export const GlobalChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSupportOnline, setIsSupportOnline] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showOfflineForm, setShowOfflineForm] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages);
      setChatMessages(parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
    
    const savedUnread = localStorage.getItem('chatUnreadCount');
    if (savedUnread) {
      setUnreadCount(parseInt(savedUnread));
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  // Check support availability (business hours: Mon-Fri, 9am-5pm EST)
  useEffect(() => {
    const checkSupportHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;
      setIsSupportOnline(isBusinessHours);
    };
    checkSupportHours();
    const interval = setInterval(checkSupportHours, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate incoming messages (in production: WebSocket listener)
  useEffect(() => {
    // TODO: Replace with WebSocket connection
    // Example: ws.on('message', handleIncomingMessage);
  }, []);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    if (isSupportOnline) {
      // TODO: Send to WebSocket/API
      console.log('Send to live chat:', newMessage.text);
      
      // Simulate support response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const supportMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Thanks for your message! A support agent will be with you shortly.',
          sender: 'support',
          timestamp: new Date(),
          unread: !isOpen
        };
        setChatMessages(prev => [...prev, supportMsg]);
        
        if (!isOpen) {
          setUnreadCount(prev => prev + 1);
          localStorage.setItem('chatUnreadCount', (unreadCount + 1).toString());
          showNotification('New message from support');
        }
      }, 2000);
    } else {
      // Show offline form
      setShowOfflineForm(true);
    }
  };

  const showNotification = (message: string) => {
    // Browser notification (requires permission)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Smart eQuiz Support', {
        body: message,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    localStorage.setItem('chatUnreadCount', '0');
    requestNotificationPermission();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 z-40 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {/* Online/Offline Indicator */}
          <div className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
            isSupportOnline ? 'bg-green-400' : 'bg-gray-400'
          }`} />
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -left-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-40 flex flex-col transition-all ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="p-4 bg-green-600 text-white rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative">
                <MessageCircle className="h-5 w-5" />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isSupportOnline ? 'bg-green-400' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Live Support</h3>
                <p className="text-xs opacity-90">
                  {isSupportOnline ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Online
                    </span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
                {/* Welcome Message */}
                {chatMessages.length === 0 && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                      <p className="text-sm">
                        👋 Hi! {isSupportOnline 
                          ? 'How can we help you today?' 
                          : "We're offline. Leave a message and we'll email you back within 24 hours."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Message History */}
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.sender === 'support' && (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className={`rounded-lg p-3 max-w-[80%] shadow-sm ${
                      msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-white'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Offline Email Form */}
              {showOfflineForm && !isSupportOnline && (
                <div className="absolute inset-0 bg-white rounded-lg p-4 flex flex-col gap-3 z-10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">We'll email you back</h4>
                    <Button variant="ghost" size="sm" onClick={() => setShowOfflineForm(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">Your message has been saved. Please provide your email for our response.</p>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const email = e.currentTarget.value;
                        if (email) {
                          console.log('Offline message with email:', email);
                          alert(`Message sent!\n\nWe'll reply to ${email} within 24 hours.`);
                          setShowOfflineForm(false);
                        }
                      }
                    }}
                  />
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      const email = input?.value;
                      if (email) {
                        console.log('Offline message with email:', email);
                        alert(`Message sent!\n\nWe'll reply to ${email} within 24 hours.`);
                        setShowOfflineForm(false);
                      }
                    }}
                  >
                    Send Message
                  </Button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t bg-white rounded-b-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleSendMessage}
                  >
                    Send
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {isSupportOnline ? 'Mon-Fri, 9am-5pm EST' : '⏰ We\'ll email you back within 24 hours'}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default GlobalChatWidget;
