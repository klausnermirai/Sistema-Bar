
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { generateId } from '../utils';
import { Plus, Edit2, Trash2, Users, Shield, Key } from 'lucide-react';
import { User } from '../types';

const Settings: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = {
    name: '',
    username: '',
    password: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.password) return;

    const userData: User = {
      id: editingId || generateId(),
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: 'admin', // Default to admin for simplicity in this app
    };

    if (editingId) {
      updateUser(userData);
    } else {
      // Simple check for duplicate username
      if (users.some(u => u.username === userData.username)) {
        alert('Este nome de usuário já existe.');
        return;
      }
      addUser(userData);
    }

    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h2>
           <p className="text-slate-500">Gerenciamento de usuários e acessos</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData(initialFormState);
            setIsFormOpen(true);
          }}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-fade-in-down max-w-2xl">
          <div className="flex items-center space-x-2 mb-4 text-slate-700">
             <Shield size={20} />
             <h3 className="font-semibold text-lg">{editingId ? 'Editar Usuário' : 'Criar Novo Acesso'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: João Silva"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Login (Usuário)</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-500 outline-none"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!editingId} // Prevent changing username on edit
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-slate-500 outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition"
              >
                {editingId ? 'Salvar Alterações' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
           <h3 className="font-semibold text-slate-700 flex items-center"><Users className="mr-2" size={18}/> Usuários Cadastrados</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Login</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acesso</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                  {user.name} 
                  {currentUser?.id === user.id && <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Você</span>}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-mono bg-slate-50 inline-block m-2 rounded px-2">{user.username}</td>
                <td className="px-6 py-4 text-sm text-slate-500 capitalize">{user.role}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Alterar Senha/Nome"
                    >
                      <Key size={18} />
                    </button>
                    {users.length > 1 && currentUser?.id !== user.id && (
                        <button 
                        onClick={() => {
                            if(confirm('Tem certeza que deseja remover este usuário?')) deleteUser(user.id);
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Remover Usuário"
                        >
                        <Trash2 size={18} />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
