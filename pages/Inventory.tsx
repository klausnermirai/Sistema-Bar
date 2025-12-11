import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { ProductStatus } from '../types';
import { formatCurrency } from '../utils';
import { AlertCircle, CheckCircle, PackageSearch } from 'lucide-react';

const Inventory: React.FC = () => {
  const { products, purchases, inventoryChecks, updateInventoryCheck } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<string>("");

  // Calculate logic for table
  const inventoryData: ProductStatus[] = products.map(product => {
    // 1. Total bought
    const productPurchases = purchases.filter(p => p.productId === product.id);
    const totalPurchasedUnits = productPurchases.reduce((acc, p) => acc + (p.quantityPackages * product.unitsPerPackage), 0);
    const totalPurchasedCost = productPurchases.reduce((acc, p) => acc + p.totalCost, 0);

    // 2. Current Stock (User Input)
    const check = inventoryChecks.find(c => c.productId === product.id);
    const currentStock = check ? check.currentStock : totalPurchasedUnits; // Default to full stock if not checked

    // 3. Implied Sales
    const estimatedSalesUnits = totalPurchasedUnits - currentStock;

    // 4. Days Logic (Mocked slightly as we need 'StartDate' of event to calculate correctly)
    // Assuming event started 5 days ago for demo purposes, or based on first purchase date
    const firstPurchaseDate = productPurchases.length > 0 
        ? new Date(productPurchases.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0].date) 
        : new Date();
    const today = new Date();
    const daysElapsed = Math.max(1, Math.ceil((today.getTime() - firstPurchaseDate.getTime()) / (1000 * 3600 * 24)));
    
    const averageDailySales = estimatedSalesUnits / daysElapsed;
    const daysRemaining = averageDailySales > 0 ? currentStock / averageDailySales : 999;

    let status: 'Critical' | 'Low' | 'Good' | 'Overstock' = 'Good';
    if (currentStock === 0) status = 'Critical';
    else if (daysRemaining < 2) status = 'Critical';
    else if (daysRemaining < 5) status = 'Low';
    else if (daysRemaining > 30) status = 'Overstock';

    return {
      product,
      totalPurchasedUnits,
      totalPurchasedCost,
      estimatedSalesUnits,
      currentStock,
      averageDailySales,
      daysRemaining,
      status
    };
  });

  const handleStockUpdate = (productId: string) => {
    const val = parseInt(tempStock);
    if (!isNaN(val)) {
        updateInventoryCheck({
            productId,
            currentStock: val,
            lastUpdated: new Date().toISOString()
        });
    }
    setEditingId(null);
  };

  const startEdit = (id: string, current: number) => {
      setEditingId(id);
      setTempStock(current.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Controle de Estoque & Previsão</h2>
           <p className="text-slate-500 text-sm">Atualize a coluna "Estoque Atual" para calcular as vendas.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Produto</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center bg-blue-50">Total Comprado (Un)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-800 uppercase text-center bg-yellow-100 border-x border-yellow-200 w-32">Estoque Atual</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center bg-green-50">Vendas Est. (Un)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center bg-green-50">Vendas Est. (R$)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Média Diária</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Previsão (Dias)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventoryData.map((row) => (
              <tr key={row.product.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{row.product.name}</td>
                <td className="px-4 py-3 text-sm text-center bg-blue-50/30 text-slate-600">{row.totalPurchasedUnits}</td>
                
                {/* Editable Stock Cell */}
                <td className="px-4 py-3 text-sm text-center bg-yellow-50 border-x border-yellow-100 cursor-pointer relative" onClick={() => !editingId && startEdit(row.product.id, row.currentStock)}>
                    {editingId === row.product.id ? (
                        <input 
                            autoFocus
                            type="number"
                            className="w-full text-center bg-white border border-yellow-400 rounded py-1 outline-none font-bold"
                            value={tempStock}
                            onChange={(e) => setTempStock(e.target.value)}
                            onBlur={() => handleStockUpdate(row.product.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleStockUpdate(row.product.id)}
                        />
                    ) : (
                        <div className="flex items-center justify-center space-x-2">
                           <span className="font-bold text-slate-800">{row.currentStock}</span>
                           <PackageSearch size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                        </div>
                    )}
                </td>

                <td className="px-4 py-3 text-sm text-center bg-green-50/30 text-emerald-700 font-medium">
                    {row.estimatedSalesUnits}
                </td>
                <td className="px-4 py-3 text-sm text-center bg-green-50/30 text-emerald-700">
                    {formatCurrency(row.estimatedSalesUnits * (row.product.packagePrice / row.product.unitsPerPackage) * 2)} {/* Assuming 2x markup for estimation viz */}
                </td>
                <td className="px-4 py-3 text-sm text-center text-slate-600">{row.averageDailySales.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm text-center font-medium">
                    {row.daysRemaining > 365 ? '> 1 Ano' : `${Math.floor(row.daysRemaining)} dias`}
                </td>
                <td className="px-4 py-3 text-center">
                    {row.status === 'Critical' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1"/> Crítico</span>}
                    {row.status === 'Low' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Baixo</span>}
                    {row.status === 'Good' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1"/> Ok</span>}
                    {row.status === 'Overstock' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Alto</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;