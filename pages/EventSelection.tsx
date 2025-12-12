
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { Beer, Calendar, ChevronRight, LogOut, Plus, Lock } from 'lucide-react';
import { formatCurrency, generateId } from '../utils';

const EventSelection: React.FC = () => {
  const { events, selectEvent, logout, addEvent, currentUser } = useData();
  const [isCreating, setIsCreating] = useState(false);
  const [newEventName, setNewEventName] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;
    
    addEvent({
      id: generateId(),
      name: newEventName,
      status: 'active',
      date: new Date().toISOString().split('T')[0]
    });
    setNewEventName('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8 text-white">
          <div className="flex items-center space-x-3">
             <div className="bg-emerald-500 p-2 rounded-lg">
                <Beer size={24} className="text-white" />
             </div>
             <div>
               <h1 className="text-2xl font-bold">Olá, {currentUser?.name}</h1>
               <p className="text-slate-400">
                 {isAdmin ? 'Gerencie ou selecione um evento' : 'Selecione um evento para acessar'}
               </p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => selectEvent(event.id)}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Beer size={64} className="text-emerald-900" />
              </div>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${event.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Calendar size={24} />
                </div>
                {event.status === 'active' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
                    Ativo
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{event.name}</h3>
              <p className="text-slate-500 text-sm mb-4">Acessar dados e relatórios</p>
              
              <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                <span>Entrar no Painel</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </button>
          ))}

          {/* Create New Event Card - ADMIN ONLY */}
          {isAdmin && (
            <div className="bg-slate-800 rounded-xl p-6 border-2 border-dashed border-slate-700 flex flex-col justify-center items-center text-center hover:border-emerald-500 hover:bg-slate-800/80 transition-all group">
              {isCreating ? (
                <form onSubmit={handleCreate} className="w-full">
                  <h3 className="text-white font-bold mb-4">Novo Evento</h3>
                  <input 
                    autoFocus
                    type="text" 
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white mb-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Nome do Evento (ex: Bar 2026)"
                    value={newEventName}
                    onChange={e => setNewEventName(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition">Criar</button>
                    <button type="button" onClick={() => setIsCreating(false)} className="flex-1 bg-slate-700 text-white py-2 rounded hover:bg-slate-600 transition">Cancelar</button>
                  </div>
                </form>
              ) : (
                <button onClick={() => setIsCreating(true)} className="w-full h-full flex flex-col items-center justify-center">
                  <div className="bg-slate-700 p-4 rounded-full mb-3 group-hover:bg-emerald-600 transition-colors">
                    <Plus size={24} className="text-white" />
                  </div>
                  <h3 className="text-slate-300 font-semibold group-hover:text-white transition-colors">Criar Novo Evento</h3>
                </button>
              )}
            </div>
          )}
          
          {/* Visual Placeholder for non-admins if list is small, to keep layout nice (optional) */}
          {!isAdmin && events.length === 0 && (
             <div className="col-span-full text-center py-10 text-slate-500">
               <Lock size={48} className="mx-auto mb-4 opacity-20" />
               <p>Nenhum evento disponível. Contate o administrador.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSelection;
