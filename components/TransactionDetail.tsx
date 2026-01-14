
import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, CheckCircle2, Clock, FileText, Bot, Building,
  Upload, ShieldCheck, Loader2, DollarSign, ShieldAlert,
  Plus, Calendar, MapPin, User, Trash2, Zap, Scale
} from 'lucide-react';
import { Transaction, AgentRole, Vendor, TransactionStage, TransactionTask } from '../types';
import { performLegalReview, performMultiAgentConsensus } from '../services/geminiService';

interface TransactionDetailProps {
  transaction: Transaction;
  onBack: () => void;
  recommendedVendors: Vendor[];
  onUpdateTransaction: (updated: Transaction) => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ 
  transaction, onBack, recommendedVendors, onUpdateTransaction
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'documents' | 'funding'>('overview');
  const [isReviewing, setIsReviewing] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const funding = transaction.funding || {
    loanAmount: transaction.price * 0.8,
    interestRate: 6.75,
    ltv: 80,
    dti: 38,
    earnestMoneyStatus: 'verified',
    underwritingStatus: 'in-progress'
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: TransactionTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: 'pending',
      assignedTo: 'User',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    };
    onUpdateTransaction({
      ...transaction,
      tasks: [...transaction.tasks, newTask]
    });
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (taskId: string) => {
    onUpdateTransaction({
      ...transaction,
      tasks: transaction.tasks.map(t => 
        t.id === taskId ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
      )
    });
  };

  const deleteTask = (taskId: string) => {
    onUpdateTransaction({
      ...transaction,
      tasks: transaction.tasks.filter(t => t.id !== taskId)
    });
  };

  const handleRunLegalReview = async (docId: string) => {
    const doc = transaction.documents.find(d => d.id === docId);
    if (!doc) return;
    setIsReviewing(docId);
    const review = await performLegalReview(doc.name, doc.type);
    onUpdateTransaction({
      ...transaction,
      documents: transaction.documents.map(d => d.id === docId ? { ...d, legalReview: review, status: 'approved' } : d)
    });
    setIsReviewing(null);
  };

  const handleDeepAudit = async () => {
    setIsAuditing(true);
    setAuditReport(null);
    const report = await performMultiAgentConsensus("Verify deal compliance and funding readiness for closing.", transaction);
    setAuditReport(report);
    setIsAuditing(false);
  };

  const timelineMilestones = [
    { label: 'Listing Date', date: transaction.listingDate, completed: true },
    { label: 'Offer Accepted', date: transaction.offerDate, completed: true },
    { label: 'Inspection Deadline', date: transaction.inspectionDeadline, completed: !!transaction.inspectionDeadline && new Date(transaction.inspectionDeadline) < new Date() },
    { label: 'Financing Deadline', date: transaction.financingDeadline, completed: transaction.stage === TransactionStage.FUNDING || transaction.stage === TransactionStage.CLOSED },
    { label: 'Closing Date', date: transaction.closingDate, completed: transaction.stage === TransactionStage.CLOSED }
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-8 border-b border-slate-100 flex items-center gap-6 bg-slate-50/50">
        <button onClick={onBack} className="p-4 bg-white hover:bg-slate-900 hover:text-white rounded-2xl transition-all text-slate-500 shadow-sm border border-slate-200 active:scale-90">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
             <h2 className="text-2xl font-black text-slate-900 truncate tracking-tight">{transaction.address}</h2>
             <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">{transaction.stage}</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-slate-500 font-black uppercase tracking-widest">
             <span className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-blue-500" /> {transaction.clientName}</span>
             <span className="flex items-center gap-2"><DollarSign className="w-3.5 h-3.5 text-emerald-500" /> ${transaction.price.toLocaleString()}</span>
             <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {transaction.id}</span>
          </div>
        </div>
        <div className="flex gap-3">
           <button 
            disabled={isAuditing}
            onClick={handleDeepAudit} 
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50"
           >
             {isAuditing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
             Multi-Agent Audit
           </button>
           <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl hover:bg-slate-800 active:scale-95">
             <Upload className="w-4 h-4" /> Upload Artifact
           </button>
           <input type="file" ref={fileInputRef} className="hidden" />
        </div>
      </div>

      <div className="flex border-b border-slate-100 px-8 pt-4 space-x-12 bg-white overflow-x-auto scrollbar-hide">
        {['overview', 'tasks', 'documents', 'funding'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)} 
            className={`pb-4 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all shrink-0 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
          {auditReport && (
            <div className="mb-10 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border-l-8 border-l-blue-600 animate-in slide-in-from-top-12 duration-500">
               <div className="flex justify-between items-start mb-8">
                  <h4 className="text-xl font-black italic tracking-tighter flex items-center gap-4">
                     <Bot className="w-8 h-8 text-blue-500" /> MAS Executive Consensus Report
                  </h4>
                  <button onClick={() => setAuditReport(null)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
               </div>
               <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-300 prose prose-invert max-w-none">
                  {auditReport}
               </div>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Deal Milestone Progression</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-100 hidden md:block"></div>
                  {timelineMilestones.map((m, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all duration-500 ${m.completed ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                        {m.completed ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <span className={`mt-4 text-[10px] font-black uppercase tracking-widest ${m.completed ? 'text-slate-800' : 'text-slate-400'}`}>{m.label}</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{m.date ? new Date(m.date).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </section>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-3">
                          <Zap className="w-4 h-4 text-blue-600" /> Pipeline Momentum
                       </h4>
                       <span className="text-2xl font-black text-blue-600">{transaction.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-4 overflow-hidden border border-slate-100 p-1">
                       <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-sm" style={{ width: `${transaction.progress}%` }}></div>
                    </div>
                 </div>
                 <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Next Critical Action</h4>
                       <p className="text-2xl font-black mb-1 leading-tight">
                          {timelineMilestones.find(m => !m.completed)?.label || 'Settlement Finalized'}
                       </p>
                    </div>
                    <Bot className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 opacity-40 group-hover:scale-110 transition-transform duration-700" />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-8 max-w-4xl">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-lg flex gap-4">
                <input 
                  type="text" 
                  placeholder="Initiate a new transaction task..." 
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                />
                <button 
                  onClick={handleAddTask}
                  className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-xl active:scale-90"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {transaction.tasks.map(task => (
                  <div key={task.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-blue-400 transition-all">
                    <button 
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`rounded-2xl w-12 h-12 flex items-center justify-center transition-all ${task.status === 'completed' ? 'text-emerald-500 bg-emerald-50' : 'text-slate-200 bg-slate-50'}`}
                    >
                      <CheckCircle2 className="w-7 h-7" />
                    </button>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h4 className={`text-sm font-black ${task.status === 'completed' ? 'line-through text-slate-300' : 'text-slate-800'}`}>{task.title}</h4>
                        <div className="flex items-center gap-4">
                           <span className="text-[9px] font-black uppercase text-slate-400">{task.dueDate}</span>
                           <button onClick={() => deleteTask(task.id)} className="text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {transaction.documents.map(doc => (
                <div key={doc.id} className="flex flex-col gap-3">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-indigo-400 transition-all">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 transition-transform group-hover:rotate-6"><FileText className="w-7 h-7" /></div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-800 tracking-tight">{doc.name}</h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase mt-1">{doc.type}</p>
                    </div>
                    {!doc.legalReview && (
                      <button 
                        disabled={isReviewing === doc.id}
                        onClick={() => handleRunLegalReview(doc.id)}
                        className="flex items-center gap-3 text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
                      >
                        {isReviewing === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        AI Legal Audit
                      </button>
                    )}
                    {doc.legalReview && (
                      <span className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" /> Compliance Verified
                      </span>
                    )}
                  </div>
                  {doc.legalReview && (
                    <div className="mx-8 p-8 bg-white border border-slate-200 rounded-[2rem] -mt-6 text-xs text-slate-700 leading-relaxed shadow-xl">
                      <div className="flex items-center gap-3 font-black uppercase tracking-[0.2em] mb-6 text-indigo-600"><Bot className="w-5 h-5" /> Executive Summary</div>
                      <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap font-medium">
                        {doc.legalReview}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-3">Allocated Funding</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">${funding.loanAmount.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-6">
                     <span className="text-[10px] font-black text-blue-600 px-3 py-1.5 bg-blue-50 rounded-xl uppercase">{funding.interestRate}% APR</span>
                  </div>
                </div>
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-lg">
                  <p className="text-[10px] text-slate-400 uppercase font-black mb-3">Risk Assessment Score</p>
                  <div className="flex flex-col gap-6">
                    <span className="text-5xl font-black text-emerald-600 tracking-tighter">88<span className="text-sm font-black text-slate-300 ml-1">AA+</span></span>
                    <div className="w-full bg-slate-50 h-3 rounded-full overflow-hidden border border-slate-100">
                       <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-[400px] bg-slate-50/50 p-10 border-l border-slate-100 space-y-12 overflow-y-auto">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                 <ShieldAlert className="w-4 h-4 text-amber-500" /> AI Compliance Shield
               </h4>
               <p className="text-xs text-slate-400 leading-relaxed font-bold italic">
                 "Our MAS analysis indicates the Debt-to-Income ratio (38%) is within the optimal 43% lending ceiling."
               </p>
             </div>
             <Zap className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5 opacity-50 transition-transform duration-1000" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3"><Building className="w-4 h-4" /> Marketplace Pro</h3>
            </div>
            <div className="space-y-4">
              {recommendedVendors.map(vendor => (
                <div key={vendor.id} className="flex gap-4 p-4 rounded-[1.5rem] bg-white border border-slate-200 hover:border-blue-400 transition-all cursor-pointer group active:scale-95">
                  <img src={vendor.imageUrl} alt={vendor.name} className="w-14 h-14 rounded-2xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-black text-slate-800 truncate uppercase">{vendor.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">{vendor.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
