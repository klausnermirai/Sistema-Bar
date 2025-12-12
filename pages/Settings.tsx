
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { generateId } from '../utils';
import { Plus, Trash2, Users, Shield, Key, Calendar, Edit2, Lock } from 'lucide-react';
import { User, Event } from '../types';

const Settings: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, events, addEvent, updateEvent, deleteEvent } = useData();
  
  const isAdmin = currentUser?.role === 'admin';

  // Default tab based on role: Users see Events tab first since they can't see Users tab
  const [activeTab, setActiveTab] = useState<'users' | 'events'>(isAdmin ? 'users' : 'events');
  
  // User Form State
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'user' as 'admin' | 'user' 
  });

  // Event Form State
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventFormData, setEventFormData] = useState({ name: '', date: '', status: 'active' as const });

  // --- USER HANDLERS ---
  const handleUserEdit = (user: User) => {
    setEditingUserId(user.id);
    setUserFormData({ 
        name: user.name, 
        username: user.username, 
        password: user.password,
        role: user.role 
    });
    setIsUserFormOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.username || !userFormData.password) return;

    const userData: User = {
      id: editingUserId || generateId(),
      name: userFormData.name,
      username: userFormData.username,
      password: userFormData.password,
      role: userFormData.role,
    };

    if (editingUserId) {
      updateUser(userData);
    } else {
      if (users.some(u => u.username === userData.username)) {
        alert('Este nome de usuário já existe.');
        return;
      }
      addUser(userData);
    }
    setUserFormData({ name: '', username: '', password: '', role: 'user' });
    setEditingUserId(null);
    setIsUserFormOpen(false);
  };

  // --- EVENT HANDLERS ---
  const handleEventEdit = (event: Event) => {
    setEditingEventId(event.id);
    setEventFormData({ name: event.name, date: event.date || '', status: event.status });
    setIsEventFormOpen(true);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventFormData.name) return;

    const eventData: Event = {
      id: editingEventId || generateId(),
      name: eventFormData.name,
      date: eventFormData.date,
      status: eventFormData.status as 'active' | 'archived',
    };

    if (editingEventId) {
      updateEvent(eventData);
    } else {
      addEvent(eventData);
    }
    setEventFormData({ name: '', date: '', status: 'active' });
    setEditingEventId(null);
    setIsEventFormOpen(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
           <p className="text-slate-500">
             {isAdmin ? 'Gerencie usuários e eventos do sistema' : 'Visualize as configurações dos eventos'}
           </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'users' ? 'bg-white border border-slate-200 border-b-white text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Usuários
          </button>
        )}
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'events' ? 'bg-white border border-slate-200 border-b-white text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Eventos
        </button>
      </div>

      {/* USERS TAB CONTENT (ADMIN ONLY) */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-6 animate-fade-in-down">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Users className="mr-2" size={20}/> Gerenciar Acessos</h3>
                <button 
                onClick={() => {
                    setEditingUserId(null);
                    setUserFormData({ name: '', username: '', password: '', role: 'user' });
                    setIsUserFormOpen(true);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm"
                >
                <Plus size={16} />
                <span>Novo Usuário</span>
                </button>
            </div>

            {isUserFormOpen && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-2xl">
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                        <input type="text" required className="w-full border border-slate-300 rounded p-2" value={userFormData.name} onChange={(e) => setUserFormData({...userFormData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Login</label>
                                <input type="text" required className="w-full border border-slate-300 rounded p-2" value={userFormData.username} onChange={(e) => setUserFormData({...userFormData, username: e.target.value})} disabled={!!editingUserId} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                                <input type="text" required className="w-full border border-slate-300 rounded p-2" value={userFormData.password} onChange={(e) => setUserFormData({...userFormData, password: e.target.value})} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Função (Permissões)</label>
                            <select 
                                className="w-full border border-slate-300 rounded p-2 bg-white"
                                value={userFormData.role}
                                onChange={(e) => setUserFormData({...userFormData, role: e.target.value as 'admin' | 'user'})}
                            >
                                <option value="user">Usuário Padrão (Apenas Movimentação)</option>
                                <option value="admin">Administrador (Controle Total)</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">Admin: Cria eventos e usuários. Usuário: Apenas lança vendas/despesas.</p>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button type="button" onClick={() => setIsUserFormOpen(false)} className="px-3 py-1 text-slate-600">Cancelar</button>
                            <button type="submit" className="bg-slate-800 text-white px-4 py-1.5 rounded">{editingUserId ? 'Salvar' : 'Criar'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Login</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Função</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm text-slate-800">{user.name} {currentUser?.id === user.id && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Você</span>}</td>
                        <td className="px-6 py-3 text-sm text-slate-600 font-mono">{user.username}</td>
                        <td className="px-6 py-3 text-sm text-slate-500 capitalize flex items-center">
                            {user.role === 'admin' ? <Shield size={14} className="mr-1 text-emerald-600"/> : <Users size={14} className="mr-1"/>}
                            {user.role}
                        </td>
                        <td className="px-6 py-3 text-center flex justify-center space-x-3">
                            <button onClick={() => handleUserEdit(user)} className="text-slate-400 hover:text-blue-600"><Key size={18} /></button>
                            {users.length > 1 && currentUser?.id !== user.id && (
                                <button onClick={() => { if(confirm('Remover usuário?')) deleteUser(user.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                            )}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}

      {/* EVENTS TAB CONTENT */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-fade-in-down">
             <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Calendar className="mr-2" size={20}/> Gerenciar Eventos</h3>
                {isAdmin && (
                    <button 
                    onClick={() => {
                        setEditingEventId(null);
                        setEventFormData({ name: '', date: '', status: 'active' });
                        setIsEventFormOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 text-sm"
                    >
                    <Plus size={16} />
                    <span>Novo Evento</span>
                    </button>
                )}
            </div>

            {isEventFormOpen && isAdmin && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 max-w-2xl">
                    <form onSubmit={handleEventSubmit} className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Evento</label>
                        <input type="text" required className="w-full border border-slate-300 rounded p-2" placeholder="Ex: Bar 2026" value={eventFormData.name} onChange={(e) => setEventFormData({...eventFormData, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início</label>
                                <input type="date" className="w-full border border-slate-300 rounded p-2" value={eventFormData.date} onChange={(e) => setEventFormData({...eventFormData, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select className="w-full border border-slate-300 rounded p-2 bg-white" value={eventFormData.status} onChange={(e) => setEventFormData({...eventFormData, status: e.target.value as any})}>
                                    <option value="active">Ativo</option>
                                    <option value="archived">Arquivado</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                            <button type="button" onClick={() => setIsEventFormOpen(false)} className="px-3 py-1 text-slate-600">Cancelar</button>
                            <button type="submit" className="bg-emerald-600 text-white px-4 py-1.5 rounded hover:bg-emerald-700">{editingEventId ? 'Salvar' : 'Criar'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Evento</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                    {isAdmin && <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Ações</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="px-6 py-3 text-sm text-slate-800 font-bold">{ev.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">{ev.date}</td>
                        <td className="px-6 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ev.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {ev.status === 'active' ? 'Ativo' : 'Arquivado'}
                            </span>
                        </td>
                        {isAdmin && (
                            <td className="px-6 py-3 text-center flex justify-center space-x-3">
                                <button onClick={() => handleEventEdit(ev)} className="text-slate-400 hover:text-blue-600"><Edit2 size={18} /></button>
                                {events.length > 1 && (
                                    <button onClick={() => { if(confirm('Atenção: Excluir um evento apagará todas as vendas e compras associadas a ele. Deseja continuar?')) deleteEvent(ev.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                                )}
                            </td>
                        )}
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
