import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, generateId, formatDate } from '../utils';
import { Plus, PackagePlus } from 'lucide-react';

const Purchases: React.FC = () => {
  const { purchases, products, addPurchase } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    quantityPackages: '',
  });

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = parseInt(formData.quantityPackages);
    if (qty <= 0) return;

    const totalCost = qty * selectedProduct.packagePrice;

    addPurchase({
      id: generateId(),
      date: formData.date,
      productId: formData.productId,
      quantityPackages: qty,
      totalCost: totalCost
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      productId: '',
      quantityPackages: ''
    });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Registro de Compras</h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Nova Compra</span>
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 animate-fade-in-down">
           <h3 className="font-semibold text-lg mb-4">Entrada de Estoque</h3>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
              <select 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                value={formData.productId}
                onChange={(e) => setFormData({...formData, productId: e.target.value})}
              >
                <option value="">Selecione um produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.packagePrice)}/pct ({p.unitsPerPackage} un)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd. Pacotes</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.quantityPackages}
                onChange={(e) => setFormData({...formData, quantityPackages: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-4 flex justify-end space-x-2 mt-2">
               {selectedProduct && formData.quantityPackages && (
                 <div className="mr-auto flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded">
                    <PackagePlus size={16} className="mr-2"/>
                    Total Estimado: <span className="font-bold text-amber-600 ml-1">{formatCurrency(parseInt(formData.quantityPackages) * selectedProduct.packagePrice)}</span>
                 </div>
               )}
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition"
              >
                Confirmar Entrada
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
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produto</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Qtd. Pacotes</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Qtd. Unidades</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Custo Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((purchase) => {
              const prod = products.find(p => p.id === purchase.productId);
              return (
                <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{formatDate(purchase.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{prod?.name || 'Produto Removido'}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">{purchase.quantityPackages}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">
                    {prod ? purchase.quantityPackages * prod.unitsPerPackage : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-amber-600 text-right">{formatCurrency(purchase.totalCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Purchases;