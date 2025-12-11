import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, generateId, formatDate } from '../utils';
import { Plus, Trash2 } from 'lucide-react';

const Expenses: React.FC = () => {
  const { expenses, addExpense } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Geral'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    addExpense({
      id: generateId(),
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'Geral'
    });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Despesas Operacionais</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nova Despesa</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-red-100 animate-fade-in-down">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Material de Limpeza, Gelo, Seguranças..."
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="md:col-span-4 flex justify-end space-x-2 mt-2">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Salvar Despesa
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Valor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-700">{formatDate(expense.date)}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{expense.description}</td>
                <td className="px-6 py-4 text-sm text-slate-500">
                   <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium">{expense.category}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-red-600 text-right">{formatCurrency(expense.amount)}</td>
                <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;