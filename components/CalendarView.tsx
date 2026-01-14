
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Transaction } from '../types';

interface CalendarViewProps {
  transactions: Transaction[];
  onSelectTransaction: (t: Transaction) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ transactions, onSelectTransaction }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Simplified calendar logic for the upcoming 30 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -7; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = getDates();

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const events: { type: string; label: string; trans: Transaction }[] = [];
    
    transactions.forEach(t => {
      if (t.inspectionDeadline === dateStr) events.push({ type: 'Inspection', label: `Insp. Deadline: ${t.address}`, trans: t });
      if (t.closingDate === dateStr) events.push({ type: 'Closing', label: `CLOSING: ${t.address}`, trans: t });
      if (t.financingDeadline === dateStr) events.push({ type: 'Financing', label: `Fin. Deadline: ${t.address}`, trans: t });
      t.tasks.forEach(task => {
        if (task.dueDate === dateStr) events.push({ type: 'Task', label: `Task: ${task.title}`, trans: t });
      });
    });
    
    return events;
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
          <CalendarIcon className="w-6 h-6 text-blue-600" /> Transaction Schedule
        </h2>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {dates.map((date, i) => {
            const events = getEventsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={i} className={`flex gap-6 ${isToday ? 'relative' : ''}`}>
                <div className="w-16 flex flex-col items-center pt-1 shrink-0">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                    {date.toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                  <span className={`text-xl font-black rounded-xl w-12 h-12 flex items-center justify-center ${isToday ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-800'}`}>
                    {date.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-h-[60px] pb-6 border-b border-slate-100 last:border-0">
                  {events.length === 0 ? (
                    <div className="h-full flex items-center">
                       <span className="text-xs font-medium text-slate-300 italic">No scheduled items</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {events.map((ev, j) => (
                        <div 
                          key={j} 
                          onClick={() => onSelectTransaction(ev.trans)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:shadow-md active:scale-95 flex items-center gap-2 ${
                            ev.type === 'Closing' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            ev.type === 'Task' ? 'bg-slate-50 border-slate-200 text-slate-600' :
                            'bg-blue-50 border-blue-200 text-blue-700'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {ev.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
