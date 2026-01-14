
import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Users, Settings, Mic, Send, Briefcase,
  Search, Calendar, Bell, X, Zap, TrendingUp, Wallet, CheckCircle, AlertTriangle, ShieldCheck, ExternalLink, Globe
} from 'lucide-react';
import { AgentRole, Transaction, ChatMessage, Vendor, PlatformMetrics, AppNotification } from './types';
import { AGENT_PERSONAS, MOCK_TRANSACTIONS, MOCK_VENDORS } from './constants';
import TransactionBoard from './components/TransactionBoard';
import TransactionDetail from './components/TransactionDetail';
import CalendarView from './components/CalendarView';
import LiveVoiceAgent from './components/LiveVoiceAgent';
import { generateAgentResponse } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'chat' | 'marketplace' | 'admin'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>(AgentRole.GENERAL);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'n1', title: 'Critical: Financing Breach', message: 'Interest rate lock for TX-102 expires in 48 hours.', type: 'deadline', timestamp: Date.now(), read: false, transactionId: 'TX-102', actionRequired: true },
    { id: 'n2', title: 'AI Audit Complete', message: 'Title commitment for 124 Maple Ave has been verified.', type: 'document', timestamp: Date.now() - 3600000, read: false, transactionId: 'TX-101' },
    { id: 'n3', title: 'Partner Update', message: 'SafeHome Inspections uploaded the final radon report.', type: 'status', timestamp: Date.now() - 7200000, read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatHistory, setChatHistory] = useState<(ChatMessage & { sources?: any[] })[]>([
    { id: 'w1', role: 'model', content: 'PropelAI Command Center Secure. Multi-Agent Systems initialized. How may I accelerate your portfolio today?', timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [metrics] = useState<PlatformMetrics>({ totalReferralFees: 52400, mrr: 18900, activeUsers: 342 });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputMessage, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const apiHistory = chatHistory.map(msg => ({ role: msg.role, parts: [{ text: msg.content }] }));
    const result = await generateAgentResponse(apiHistory, userMsg.content, selectedAgent, useSearch);

    setChatHistory(prev => [...prev, { 
      id: (Date.now()+1).toString(), 
      role: 'model', 
      content: result.text, 
      senderName: selectedAgent, 
      timestamp: Date.now(),
      sources: result.sources
    }]);
    setIsTyping(false);
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selectedTransaction?.id === updated.id) {
       setSelectedTransaction(updated);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      <aside className="w-[300px] bg-slate-900 text-white flex flex-col shrink-0 hidden lg:flex relative overflow-hidden border-r border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] -mr-40 -mt-40"></div>
        <div className="p-12 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3.5 rounded-[1.25rem] shadow-[0_15px_35px_rgba(37,99,235,0.4)] rotate-3"><Briefcase className="w-7 h-7 text-white" /></div>
            <span className="text-4xl font-black tracking-tighter italic">Propel<span className="text-blue-500">AI</span></span>
          </div>
        </div>
        <nav className="flex-1 p-8 mt-10 space-y-4 relative z-10">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Command' },
            { id: 'calendar', icon: Calendar, label: 'Schedule' },
            { id: 'chat', icon: MessageSquare, label: 'Advisory' },
            { id: 'marketplace', icon: Users, label: 'Partners' },
            { id: 'admin', icon: TrendingUp, label: 'Capital' }
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] transition-all font-black text-[11px] uppercase tracking-[0.3em] ${activeTab === item.id ? 'bg-white text-slate-900 shadow-2xl scale-[1.05] border-l-4 border-l-blue-600' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : ''}`} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-10 border-t border-white/5 m-8 bg-white/5 rounded-[3rem] backdrop-blur-2xl relative z-10">
           <p className="text-[10px] text-slate-500 uppercase font-black mb-4 tracking-[0.4em]">Ecosystem Yield</p>
           <div className="flex items-center gap-4 text-emerald-400 font-black text-3xl tracking-tighter">
              <Wallet className="w-8 h-8" /> ${metrics.totalReferralFees.toLocaleString()}
           </div>
           <div className="w-full bg-white/5 h-2 rounded-full mt-6 overflow-hidden border border-white/5">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full w-[65%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-28 bg-white/95 backdrop-blur-2xl border-b border-slate-200 flex items-center justify-between px-12 shrink-0 z-30">
          <div className="flex flex-col">
             <h1 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-1">{activeTab} Node</h1>
             <p className="text-xs font-bold text-slate-800 uppercase tracking-tight">Status: Systems Nominal / Multi-Agent Active</p>
          </div>
          <div className="flex items-center gap-8">
             <div className="flex -space-x-4 mr-8">
                {Object.values(AgentRole).map((r, i) => (
                   <div key={i} title={r} className={`w-12 h-12 rounded-[1.25rem] border-4 border-white flex items-center justify-center text-[11px] font-black text-white shadow-2xl transition-all hover:-translate-y-2 hover:rotate-3 cursor-pointer bg-gradient-to-tr ${i===0?'from-blue-600 to-indigo-800':i===1?'from-indigo-600 to-purple-800':i===2?'from-emerald-600 to-teal-800':'from-slate-800 to-black'}`}>
                      {r[0]}
                   </div>
                ))}
             </div>
             
             <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-5 rounded-2xl transition-all relative shadow-sm border border-slate-200 ${showNotifications ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                   <Bell className="w-6 h-6" />
                   {unreadCount > 0 && <span className="absolute top-4.5 right-4.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white animate-pulse"></span>}
                </button>
                
                {showNotifications && (
                   <div className="absolute right-0 mt-6 w-[450px] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden z-50 animate-in zoom-in-95 duration-200">
                      <div className="p-8 bg-slate-900 text-white border-b border-white/10 flex justify-between items-center">
                         <span className="text-[11px] font-black uppercase tracking-[0.4em]">Protocol Alerts</span>
                         <button onClick={() => setNotifications(n => n.map(x => ({...x, read: true})))} className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Acknowledge All</button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                         {notifications.map(n => (
                            <div key={n.id} onClick={() => { setShowNotifications(false); if(n.transactionId) { setSelectedTransaction(transactions.find(t => t.id === n.transactionId) || null); setActiveTab('dashboard'); } }} className={`p-8 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all ${!n.read ? 'bg-blue-50/40 border-l-4 border-l-blue-600' : ''}`}>
                               <div className="flex gap-6">
                                  {n.type === 'deadline' ? <div className="p-3 bg-red-100 rounded-2xl shrink-0 h-fit shadow-inner"><AlertTriangle className="w-5 h-5 text-red-600" /></div> : <div className="p-3 bg-blue-100 rounded-2xl shrink-0 h-fit shadow-inner"><ShieldCheck className="w-5 h-5 text-blue-600" /></div>}
                                  <div>
                                     <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{n.title}</h5>
                                     <p className="text-sm text-slate-500 leading-relaxed font-bold tracking-tight">{n.message}</p>
                                     <div className="flex gap-4 mt-4">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        {n.actionRequired && <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest animate-pulse flex items-center gap-1"><Zap className="w-3 h-3" /> Action Required</span>}
                                     </div>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
             </div>

             <button className="p-5 bg-white text-slate-500 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-900 hover:text-white transition-all"><Settings className="w-6 h-6" /></button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-12 bg-slate-50/60 scrollbar-hide">
          {activeTab === 'dashboard' && (
            selectedTransaction ? (
              <TransactionDetail 
                transaction={selectedTransaction} 
                onBack={() => setSelectedTransaction(null)}
                recommendedVendors={MOCK_VENDORS}
                onUpdateTransaction={updateTransaction}
              />
            ) : <TransactionBoard transactions={transactions} onSelectTransaction={setSelectedTransaction} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView transactions={transactions} onSelectTransaction={(t) => {
              setSelectedTransaction(t);
              setActiveTab('dashboard');
            }} />
          )}

          {activeTab === 'chat' && (
            <div className="flex h-full gap-12">
              <div className="w-[360px] shrink-0 bg-white rounded-[4rem] border border-slate-200 p-12 hidden lg:flex flex-col shadow-2xl">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase mb-10 tracking-[0.4em]">Multi-Agent Council</h3>
                 <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                    {Object.values(AgentRole).map(role => (
                      <button key={role} onClick={() => setSelectedAgent(role)}
                        className={`w-full text-left px-8 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group ${selectedAgent === role ? 'bg-slate-900 text-white shadow-[0_20px_40px_rgba(0,0,0,0.2)] scale-[1.05]' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 border border-transparent hover:border-slate-200'}`}>
                        {role}
                        {selectedAgent === role && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>}
                      </button>
                    ))}
                 </div>
                 <div className="mt-12 space-y-4">
                    <button 
                      onClick={() => setUseSearch(!useSearch)}
                      className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${useSearch ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    >
                       <Globe className="w-4 h-4" /> Market Grounding: {useSearch ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => {}} className="w-full flex items-center justify-center gap-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] hover:shadow-[0_25px_50px_rgba(37,99,235,0.5)] transition-all active:scale-95 group border-b-4 border-white/20">
                       <Zap className="w-5 h-5 group-hover:animate-bounce" /> Executive Review
                    </button>
                 </div>
              </div>

              <div className="flex-1 bg-white rounded-[4rem] border border-slate-200 flex flex-col overflow-hidden shadow-2xl relative border-t-[12px] border-t-slate-900">
                 <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                       <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-800">Protocol: Advisory Hub — {selectedAgent}</span>
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
                    {chatHistory.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                         <div className={`max-w-[85%] rounded-[3rem] px-10 py-7 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                            {msg.senderName && <div className="text-[10px] font-black mb-4 opacity-70 uppercase tracking-[0.4em] flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-current"></div> {msg.senderName}
                            </div>}
                            <div className="whitespace-pre-wrap font-bold tracking-tight">{msg.content}</div>
                            
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-slate-200/50">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center gap-2">
                                  <ExternalLink className="w-3 h-3" /> Grounded Intelligence Sources
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {msg.sources.map((source: any, idx: number) => (
                                    <a key={idx} href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="bg-white/50 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2">
                                      {source.web?.title || 'External Report'}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                         </div>
                      </div>
                    ))}
                    {isTyping && <div className="flex justify-start"><div className="bg-white border border-slate-200 text-slate-400 rounded-full px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] animate-pulse shadow-sm">Analyzing Protocol Streams...</div></div>}
                    <div ref={chatEndRef} />
                 </div>
                 <div className="p-10 bg-white border-t border-slate-200 flex items-center gap-5">
                    <input 
                      type="text" className="flex-1 bg-slate-50 border border-slate-100 rounded-[2.5rem] px-10 py-6 text-sm font-bold focus:outline-none focus:ring-[16px] focus:ring-blue-500/5 transition-all shadow-inner placeholder:text-slate-300"
                      placeholder={`Direct Command to ${selectedAgent}...`} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={() => setVoiceActive(true)} className="p-6 bg-slate-900 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl active:scale-90 border-b-4 border-black/30"><Mic className="w-7 h-7" /></button>
                    <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} className="p-6 bg-blue-600 text-white rounded-[1.5rem] hover:bg-blue-700 disabled:opacity-50 shadow-2xl shadow-blue-500/30 active:scale-90 transition-all border-b-4 border-blue-800/50"><Send className="w-7 h-7" /></button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
             <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                   <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all group border-b-[12px] border-b-blue-600">
                      <p className="text-slate-400 text-[11px] mb-6 font-black uppercase tracking-[0.5em]">Network Yield (MRR)</p>
                      <h2 className="text-6xl font-black text-slate-900 tracking-tighter group-hover:text-blue-600 transition-colors italic">${metrics.mrr.toLocaleString()}</h2>
                      <div className="flex items-center gap-3 mt-8 text-emerald-500 bg-emerald-50 w-fit px-4 py-2 rounded-2xl border border-emerald-100">
                         <TrendingUp className="w-5 h-5" />
                         <span className="text-[11px] font-black uppercase tracking-widest">+22.4%</span>
                      </div>
                   </div>
                   <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all group border-b-[12px] border-b-emerald-600">
                      <p className="text-slate-400 text-[11px] mb-6 font-black uppercase tracking-[0.5em]">Aggregated Fees</p>
                      <h2 className="text-6xl font-black text-emerald-600 tracking-tighter group-hover:scale-105 transition-transform">${(metrics.totalReferralFees).toLocaleString()}</h2>
                      <p className="text-[11px] text-slate-400 mt-8 font-black uppercase tracking-widest italic">Secured Settlements</p>
                   </div>
                   <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-2xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all group border-b-[12px] border-b-slate-900">
                      <p className="text-slate-400 text-[11px] mb-6 font-black uppercase tracking-[0.5em]">Active Node Users</p>
                      <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{metrics.activeUsers}</h2>
                      <p className="text-[11px] text-slate-400 mt-8 font-black uppercase tracking-widest italic">Provisioned Seats</p>
                   </div>
                </div>
                
                <div className="bg-slate-900 rounded-[5rem] p-24 text-white relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-white/5">
                   <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-blue-600/10 blur-[200px] -mr-500 -mt-500 animate-pulse"></div>
                   <div className="relative z-10 max-w-4xl">
                      <div className="inline-flex items-center gap-4 px-8 py-3 bg-blue-600/20 rounded-full border border-blue-500/30 text-[11px] font-black uppercase tracking-[0.5em] mb-12 text-blue-400 shadow-inner">
                         <Zap className="w-5 h-5" /> Predictive Yield Engine
                      </div>
                      <h3 className="text-8xl font-black mb-12 tracking-tighter leading-[0.9] italic">The Future of <br/><span className="text-blue-500 underline decoration-8 decoration-white/10">Settlement.</span></h3>
                      <p className="text-slate-400 text-2xl mb-16 font-bold leading-relaxed tracking-tight max-w-2xl">PropelAI has eliminated the closing friction for $4.2B in transactional volume. Our autonomous agents are currently reducing settlement time by an average of 14 days.</p>
                      <div className="flex flex-wrap gap-8">
                         <button className="bg-white text-slate-900 px-12 py-7 rounded-[3rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-slate-100 transition-all active:scale-95 shadow-[0_25px_60px_rgba(255,255,255,0.15)] border-b-4 border-slate-300">Investor Terminal</button>
                         <button className="bg-white/5 text-white px-12 py-7 rounded-[3rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white/10 border border-white/10 backdrop-blur-3xl transition-all border-b-4 border-white/10">Strategic Expansion</button>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      </main>
      <LiveVoiceAgent active={voiceActive} onClose={() => setVoiceActive(false)} role={selectedAgent} />
    </div>
  );
};

export default App;
