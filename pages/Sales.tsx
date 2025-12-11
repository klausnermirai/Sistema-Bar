import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, generateId, formatDate } from '../utils';
import { Plus, Trash2 } from 'lucide-react';

const Sales: React.FC = () => {
  const { sales, addSale } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amountCash: '',
    amountPix: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cash = parseFloat(formData.amountCash) || 0;
    const pix = parseFloat(formData.amountPix) || 0;

    if (cash === 0 && pix === 0) return;

    addSale({
      id: generateId(),
      date: formData.date,
      amountCash: cash,
      amountPix: pix,
      total: cash + pix
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amountCash: '',
      amountPix: ''
    });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Controle de Vendas</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nova Venda</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-emerald-100 animate-fade-in-down">
          <h3 className="font-semibold text-lg mb-4">Adicionar Fechamento Diário</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Dinheiro (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.amountCash}
                onChange={(e) => setFormData({...formData, amountCash: e.target.value})}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor PIX (R$)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.amountPix}
                onChange={(e) => setFormData({...formData, amountPix: e.target.value})}
                placeholder="0,00"
              />
            </div>
            <div className="flex space-x-2">
              <button 
                type="submit"
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                Salvar
              </button>
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
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
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dinheiro</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">PIX</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-700 font-medium">{formatDate(sale.date)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(sale.amountCash)}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{formatCurrency(sale.amountPix)}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-600">{formatCurrency(sale.total)}</td>
                <td className="px-6 py-4">
                  <button className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-bold">
            <tr>
               <td className="px-6 py-4 text-slate-800">TOTAL ACUMULADO</td>
               <td className="px-6 py-4 text-slate-800">{formatCurrency(sales.reduce((acc, s) => acc + s.amountCash, 0))}</td>
               <td className="px-6 py-4 text-slate-800">{formatCurrency(sales.reduce((acc, s) => acc + s.amountPix, 0))}</td>
               <td className="px-6 py-4 text-emerald-700">{formatCurrency(sales.reduce((acc, s) => acc + s.total, 0))}</td>
               <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Sales;