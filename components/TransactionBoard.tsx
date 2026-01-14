
import React, { useState } from 'react';
import { Search, Filter, Plus, CheckCircle, Briefcase, ListTodo, AlertCircle } from 'lucide-react';
import { Transaction, TransactionStage, TransactionTask } from '../types';

interface TransactionBoardProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}

const TransactionBoard: React.FC<TransactionBoardProps> = ({ transactions, onSelectTransaction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const stages = Object.values(TransactionStage);

  const filteredTransactions = transactions.filter(t => 
    t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allTasks: TransactionTask[] = transactions.flatMap(t => 
    t.tasks.map(task => ({ ...task, address: t.address, transactionId: t.id }))
  );

  const pendingTasks = allTasks.filter(tk => tk.status !== 'completed');

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* 1. Global Search System */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search transactions, clients, or document artifacts..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold focus:outline-none focus:ring-8 focus:ring-blue-500/5 shadow-sm transition-all placeholder:text-slate-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" /> Filter Stack
          </button>
          <button className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
            <Plus className="w-4 h-4" /> Create Deal
          </button>
        </div>
      </div>

      {/* 2. Dashboard Task Management System */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-4">
        <div className="xl:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
          <div className="relative z-10">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 flex items-center gap-3">
                   <ListTodo className="w-4 h-4" /> Global Task Command
                </h3>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black">{pendingTasks.length} Pending</span>
             </div>
             <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide">
                {pendingTasks.length === 0 ? (
                  <p className="text-slate-500 text-xs italic font-medium">All systems green. No immediate tasks pending across portfolio.</p>
                ) : (
                  pendingTasks.slice(0, 4).map(tk => (
                    <div key={tk.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${tk.status === 'blocked' ? 'bg-red-500 animate-pulse' : 'bg-blue-400'}`}></div>
                          <div>
                             <p className="text-[11px] font-black leading-tight uppercase tracking-tight">{tk.title}</p>
                             <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{tk.address}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-black text-slate-500 uppercase">{tk.dueDate}</span>
                    </div>
                  ))
                )}
             </div>
          </div>
          <AlertCircle className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 pointer-events-none" />
        </div>
        
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl flex flex-col justify-between">
           <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Pipeline Velocity</h3>
              <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black text-slate-900 tracking-tighter">72<span className="text-xl">%</span></span>
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+4% This Week</span>
              </div>
           </div>
           <div className="w-full bg-slate-50 h-2 rounded-full mt-6 overflow-hidden">
              <div className="bg-blue-600 h-full w-[72%] rounded-full"></div>
           </div>
        </div>
      </div>

      {/* 3. Detailed Kanban Pipeline */}
      <div className="flex-1 flex h-full overflow-x-auto space-x-6 pb-6 scrollbar-hide">
        {stages.map((stage) => {
          const items = filteredTransactions.filter((t) => t.stage === stage);
          return (
            <div key={stage} className="min-w-[340px] max-w-[340px] flex-shrink-0 flex flex-col bg-slate-100/40 rounded-[2.5rem] p-5 border border-slate-200/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-5 flex justify-between items-center tracking-[0.2em] px-3">
                {stage}
                <span className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-xl font-black text-[9px]">{items.length}</span>
              </h3>
              <div className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-hide">
                {items.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                    <Briefcase className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Active Deals</span>
                  </div>
                ) : (
                  items.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => onSelectTransaction(t)}
                      className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group active:scale-[0.98] border-b-4 border-b-transparent hover:border-b-blue-600"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg tracking-widest uppercase">{t.id}</span>
                        <div className="flex -space-x-2">
                           {t.tasks.slice(0, 3).map((tk, idx) => (
                              <div key={idx} className={`w-6 h-6 rounded-full border-2 border-white text-[8px] flex items-center justify-center font-black ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                 {tk.assignedTo === 'User' ? 'U' : tk.assignedTo[0]}
                              </div>
                           ))}
                        </div>
                      </div>
                      <h4 className="font-black text-slate-800 mb-1 text-sm group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tight">{t.address}</h4>
                      <p className="text-[10px] text-slate-400 mb-6 font-bold uppercase tracking-widest italic">{t.clientName}</p>
                      
                      <div className="w-full bg-slate-50 rounded-full h-1.5 mb-4 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${t.progress}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                         <div className="flex items-center gap-2">
                            <CheckCircle className={`w-4 h-4 ${t.tasks.every(tk => tk.status === 'completed') ? 'text-emerald-500' : 'text-slate-200'}`} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                               {t.tasks.filter(tk => tk.status === 'completed').length}/{t.tasks.length} Completed
                            </span>
                         </div>
                         <span className="text-[10px] font-black text-slate-900 uppercase bg-slate-50 px-3 py-1.5 rounded-xl">
                            {t.progress}%
                         </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionBoard;
