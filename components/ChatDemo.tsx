import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { streamChat, isApiKeyPresent } from '../services/geminiService';

export const ChatDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(isApiKeyPresent());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const onChange = () => setHasApiKey(isApiKeyPresent());
    window.addEventListener('veggie_api_key_changed', onChange);
    return () => window.removeEventListener('veggie_api_key_changed', onChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '' }]);

    try {
      // Prepare history for context
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const stream = await streamChat(userMsg.text, history);

      for await (const chunk of stream) {
        const text = chunk.text;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId ? { ...msg, text: msg.text + (text || '') } : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: "Error: Could not generate response.", isError: true } : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {!hasApiKey && (
        <div className="p-4 bg-yellow-600 text-white rounded mb-2 text-center">
          沒有設定 Gemini API Key，語言模型功能在此環境中將無法使用。請點右上方的鑰匙圖示，直接在網頁輸入您的 Gemini API Key (此作法會儲存在本機 localStorage)。
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <Bot size={64} className="mb-4" />
            <p className="text-xl">Start chatting with Gemini 2.0</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 flex items-start space-x-3 ${
                msg.role === 'user'
                  ? 'bg-gemini-600 text-white rounded-br-none'
                  : 'bg-panel text-gray-100 rounded-bl-none border border-gray-800'
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} className="text-gemini-400" />}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800 bg-deep-space">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="w-full bg-panel text-white rounded-xl pl-4 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-gemini-500 border border-gray-700 placeholder-gray-500 transition-all"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-3 top-3 p-2 bg-gemini-600 text-white rounded-lg hover:bg-gemini-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};