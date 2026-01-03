
import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { generateLabReport } from '../services/geminiService';
import { Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ isOpen, onClose, state }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await generateLabReport(userMsg, {
      instruments: state.instruments,
      materials: state.materials,
      userQualifications: state.currentUser!.qualifications,
      users: state.users // 傳遞完整人員數據以利分析訓練狀態
    });

    setMessages(prev => [...prev, { role: 'bot', content: response || "抱歉，我現在無法回答。" }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold">QMS 數位助理</h3>
              <p className="text-xs text-indigo-100">ISO 17025 專家模式</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot size={48} className="mx-auto text-indigo-200 mb-4" />
              <p className="text-slate-500 font-medium italic">
                您可以問我：「列出需要回訓的人員名單」或「分析目前的教育訓練覆蓋率」。
              </p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none prose prose-slate max-w-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
                <span className="text-sm text-slate-500">正在掃描人員資料並分析訓練時效...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="輸入問題或指令..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantModal;
