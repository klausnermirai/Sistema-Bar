
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, generateId, formatDate } from '../utils';
import { Plus, PackagePlus, AlertCircle, Calculator } from 'lucide-react';

const Purchases: React.FC = () => {
  const { purchases, products, suppliers, addPurchase } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    supplierName: '',
    quantityPackages: '',
    costPerPackage: '', // The actual price paid per package
  });

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const prod = products.find(p => p.id === pId);
    
    setFormData(prev => ({
      ...prev,
      productId: pId,
      // Auto-select the product's default supplier
      supplierName: prod ? prod.supplier : prev.supplierName,
      // Auto-fill the catalog price, but allow user to change it
      costPerPackage: prod ? prod.packagePrice.toString() : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !formData.supplierName || !formData.costPerPackage) return;

    const qty = parseInt(formData.quantityPackages);
    const costPkg = parseFloat(formData.costPerPackage);

    if (qty <= 0 || costPkg < 0) return;

    const totalCost = qty * costPkg;
    
    // Calculate Unit Cost based on current product packaging
    // This snapshot ensures that if packaging changes later, this record remains accurate
    const unitCostSnapshot = costPkg / selectedProduct.unitsPerPackage;

    addPurchase({
      id: generateId(),
      date: formData.date,
      productId: formData.productId,
      supplierName: formData.supplierName,
      quantityPackages: qty,
      totalCost: totalCost,
      unitCostSnapshot: unitCostSnapshot
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      productId: '',
      supplierName: '',
      quantityPackages: '',
      costPerPackage: ''
    });
    setIsFormOpen(false);
  };

  // Calculations for display
  const totalPurchaseValue = formData.quantityPackages && formData.costPerPackage
    ? parseInt(formData.quantityPackages) * parseFloat(formData.costPerPackage)
    : 0;
  
  const previewUnitCost = selectedProduct && formData.costPerPackage
    ? parseFloat(formData.costPerPackage) / selectedProduct.unitsPerPackage
    : 0;

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
           <h3 className="font-semibold text-lg mb-4 text-amber-800 flex items-center">
             <PackagePlus className="mr-2" size={20}/> Entrada de Estoque
           </h3>
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            
            {/* Row 1 */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
              <input 
                type="date" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Produto</label>
              <select 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                value={formData.productId}
                onChange={handleProductChange}
              >
                <option value="">Selecione um produto...</option>
                {products.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.unitsPerPackage} un/{p.measureUnit})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fornecedor</label>
              <select 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                value={formData.supplierName}
                onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
              >
                <option value="">Selecione...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Row 2 */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Qtd ({selectedProduct?.measureUnit || 'Pct'})</label>
              <input 
                type="number" 
                min="1"
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                value={formData.quantityPackages}
                onChange={(e) => setFormData({...formData, quantityPackages: e.target.value})}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preço do Pacote (R$)</label>
               <div className="relative">
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.costPerPackage}
                  onChange={(e) => setFormData({...formData, costPerPackage: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              {/* Unit Cost Preview */}
              {selectedProduct && formData.costPerPackage && (
                 <div className="text-xs mt-1 flex items-center bg-slate-100 p-1 rounded text-slate-600">
                   <Calculator size={10} className="mr-1"/> 
                   Sai a <span className="font-bold text-emerald-600 mx-1">{formatCurrency(previewUnitCost)}</span> /unidade
                 </div>
              )}
            </div>

            <div className="md:col-span-3">
                <label className="block text-sm font-medium text-slate-500 mb-1">Total da Nota</label>
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800 font-bold h-[42px] flex items-center">
                    {formatCurrency(totalPurchaseValue)}
                </div>
            </div>

            <div className="md:col-span-6 flex justify-end space-x-2 mt-4 pt-4 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition font-medium"
              >
                Confirmar Compra
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
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fornecedor</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Qtd. Compra</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Preço (Pacote/Cx)</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-emerald-50/30">Custo (Unidade)</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((purchase) => {
              const prod = products.find(p => p.id === purchase.productId);
              
              // Use stored snapshot if available, otherwise calculate fallback for legacy data
              let unitCost = purchase.unitCostSnapshot;
              if (unitCost === undefined) {
                 const pricePerPackage = purchase.totalCost / purchase.quantityPackages;
                 unitCost = prod ? pricePerPackage / prod.unitsPerPackage : 0;
              }
              
              const pricePerPackageDisplay = purchase.totalCost / purchase.quantityPackages;

              return (
                <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-700">{formatDate(purchase.date)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {prod?.name || 'Produto Removido'}
                    {prod && <span className="text-xs text-slate-400 block">{prod.unitsPerPackage} un/{prod.measureUnit}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{purchase.supplierName || prod?.supplier}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">{purchase.quantityPackages} {prod?.measureUnit}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 text-right">
                    {formatCurrency(pricePerPackageDisplay)}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-600 font-bold text-right bg-emerald-50/30">
                    {formatCurrency(unitCost)}
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
