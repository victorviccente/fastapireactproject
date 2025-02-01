import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles,
  Plus,
  ArrowDown,
  Check,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://fastapi-backend-je9z.onrender.com'
  : 'http://localhost:5009';

const Chat = ({ onTaskCreated }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAskingForTaskName, setIsAskingForTaskName] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Detecta quando deve mostrar o botão de scroll
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const bottomTolerance = 100;
    
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > bottomTolerance);
  };

  // Scroll suave para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setChatMessages([
      { 
        role: 'assistant', 
        content: 'Olá! Eu sou o assistente do Taskis. 👋',
        timestamp: new Date().toISOString()
      },
      { 
        role: 'assistant', 
        content: 'Como posso ajudar você hoje?',
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  useEffect(() => {
    if (messageSent) {
      scrollToBottom();
      setMessageSent(false);
    }
  }, [chatMessages, messageSent]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: message,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setMessageSent(true);
    setLoading(true);

    try {
      if (isAskingForTaskName) {
        await onTaskCreated(message);
        
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✨ Tarefa "${message}" criada com sucesso!`,
          timestamp: new Date().toISOString()
        }]);
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Posso ajudar com mais alguma coisa?',
            timestamp: new Date().toISOString()
          }]);
          setMessageSent(true);
        }, 500);
        
      } else {
        const response = await axios.post(`${API_URL}/api/chat`, {
          message: message
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: response.data.response,
          timestamp: new Date().toISOString()
        }]);
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'O que mais você gostaria de fazer?',
            timestamp: new Date().toISOString()
          }]);
          setMessageSent(true);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Pode tentar novamente?',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-blue-100 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center gap-4">
        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="space-y-1">
          <h2 className="font-semibold text-white text-lg">Assistente Taskis</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-sm text-white/90">Online</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button 
            onClick={() => {
              setChatMessages([]);
              setTimeout(() => {
                setChatMessages([
                  { 
                    role: 'assistant', 
                    content: 'Olá! Eu sou o assistente do Taskis. 👋',
                    timestamp: new Date().toISOString()
                  },
                  { 
                    role: 'assistant', 
                    content: 'Como posso ajudar você hoje?',
                    timestamp: new Date().toISOString()
                  }
                ]);
              }, 200);
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </button>
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-blue-100" />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-blue-50/50 to-blue-100/20"
      >
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-4 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            } ${loading && index === chatMessages.length - 1 ? 'animate-pop-in' : ''}`}
          >
            {msg.role !== 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className={`group relative max-w-[80%] ${
              msg.role === 'user' 
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700'
            } p-4 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 ${
              msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <span className={`block mt-1 text-[10px] ${
                msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {getMessageTime(msg.timestamp)}
              </span>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-md max-w-[80%] animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 animate-bounce"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
      )}

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-blue-100">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 text-sm placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes pop-in {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};

export default Chat;