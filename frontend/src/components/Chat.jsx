import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.PROD 
  ? 'https://fastapi-backend-je9z.onrender.com'
  : 'http://localhost:5009';

const Chat = ({ onTaskCreated }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAskingForTaskName, setIsAskingForTaskName] = useState(true);

  const mainColor = '#BA4949';
  const gradientStrong = 'from-[#BA4949] to-[#D47676]';

  useEffect(() => {
    setChatMessages([
      { 
        role: 'assistant', 
        content: 'Olá! Eu sou o assistente do Taskis. 👋',
        timestamp: new Date().toISOString()
      },
      { 
        role: 'assistant', 
        content: 'Qual tarefa deseja criar?',
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { 
      role: 'user', 
      content: message,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);

    setLoading(true);
    try {
      if (isAskingForTaskName) {
        onTaskCreated(message);
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `✨ Tarefa "${message}" adicionada com sucesso!`,
          timestamp: new Date().toISOString()
        }]);
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Deseja criar mais uma tarefa?',
            timestamp: new Date().toISOString()
          }]);
        }, 500);
        
        setIsAskingForTaskName(true);
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
        
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Qual tarefa deseja criar?',
          timestamp: new Date().toISOString()
        }]);
        setIsAskingForTaskName(true);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Pode tentar novamente?',
        timestamp: new Date().toISOString()
      }]);
      setIsAskingForTaskName(false);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden flex flex-col h-full border border-[#BA4949]/10">
      {/* Cabeçalho do Chat - Altura fixa */}
      <div className={`p-4 bg-gradient-to-r ${gradientStrong} flex items-center gap-3`}>
        <div className="p-1.5 bg-white/10 rounded-lg">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-medium text-white text-sm">Assistente Taskis</h2>
          <p className="text-[11px] text-white/80">Sempre online para ajudar</p>
        </div>
        <div className="p-1.5 bg-white/10 rounded-lg ml-auto">
          <Sparkles className="w-3 h-3 text-yellow-300" />
        </div>
      </div>

      {/* Área de Mensagens - Altura flexível com scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-[#BA4949]/5">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${gradientStrong} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`group max-w-[80%] p-2.5 rounded-xl transition-all duration-200 text-sm ${
                msg.role === 'user'
                  ? `bg-gradient-to-r ${gradientStrong} text-white rounded-br-none shadow-sm`
                  : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-[#BA4949]/10'
              }`}
            >
              <p className="mb-0.5 leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] ${msg.role === 'user' ? 'text-white/70' : 'text-gray-400'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${gradientStrong} flex items-center justify-center flex-shrink-0`}>
                <User className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start items-start gap-2">
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${gradientStrong} flex items-center justify-center`}>
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white p-2.5 rounded-xl rounded-bl-none shadow-sm border border-[#BA4949]/10">
              <Loader2 className="w-4 h-4 animate-spin text-[#BA4949]" />
            </div>
          </div>
        )}
      </div>

      {/* Input de Mensagem - Altura fixa */}
      <div className="p-3 bg-white border-t border-[#BA4949]/10">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="w-full px-3 py-2 pr-10 bg-white border border-[#BA4949]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BA4949]/30 focus:border-[#BA4949] disabled:bg-gray-50 disabled:cursor-not-allowed transition-all text-sm"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r ${gradientStrong} text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;