import React, { useState, useEffect, useRef } from 'react';
import { MessageSquareCode, Send, Trash2, Bot, User, Sparkles, BookOpen, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const SUGGESTED_PROMPTS = [
  "Explain portfolio diversification",
  "How does the Sharpe ratio work?",
  "How should I evaluate a stock P/E ratio?",
  "What does maximum drawdown mean?"
];

export default function FinancialAssistant() {
  const { addToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoFallback, setIsDemoFallback] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get('/ai/chat/history');
      if (res.data.success && res.data.messages.length > 0) {
        setMessages(res.data.messages);
      } else {
        // Welcome message
        setMessages([
          {
            sender: 'ai',
            text: "Hello! I am your RAG Financial Assistant. Ask me anything about investing fundamentals, risk management, Sharpe ratio, technical analysis, or portfolio strategy.",
            sources: ["Financial Education Knowledge Base"],
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (questionText = input) => {
    const query = questionText.trim();
    if (!query) return;

    const userMsg = { sender: 'user', text: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { question: query });
      if (res.data.success) {
        setIsDemoFallback(res.data.isDemoFallback || false);
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: res.data.answer,
            sources: res.data.sources || [],
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send query', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete('/ai/chat/history');
      setMessages([
        {
          sender: 'ai',
          text: "Chat history cleared. What financial question would you like to explore next?",
          sources: [],
          timestamp: new Date()
        }
      ]);
      addToast('Chat history cleared', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4 animate-fade-in">
      {/* Top Banner */}
      <div className="glass-panel px-6 py-4 rounded-3xl border border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center glow-blue">
            <MessageSquareCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">RAG Financial Assistant</h1>
            <p className="text-xs text-slate-400">Contextual financial intelligence powered by local document retrieval</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          Clear Chat
        </button>
      </div>

      {isDemoFallback && (
        <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 shrink-0">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>AI API key not configured — running in demo educational RAG mode.</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 glass-card rounded-3xl p-6 border border-slate-800 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
              msg.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
            }`}>
              <ReactMarkdown className="prose prose-invert prose-xs max-w-none">
                {msg.text}
              </ReactMarkdown>

              {/* RAG Sources Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[10px] text-blue-400">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Sources: {msg.sources.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono animate-pulse p-2">
            <Bot className="w-4 h-4 text-purple-400" />
            <span>Analyzing financial knowledge base...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0">
        <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs transition-all shrink-0 hover:border-blue-500/40"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="glass-card p-2 rounded-2xl border border-slate-800 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a financial question (e.g., What is Sharpe Ratio?)..."
          className="flex-1 px-4 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50 glow-blue"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
