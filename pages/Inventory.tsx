
import React, { useState } from 'react';
import { useData } from '../services/DataManager';
import { ProductStatus } from '../types';
import { formatCurrency } from '../utils';
import { AlertCircle, CheckCircle, PackageSearch, Lock, Calculator } from 'lucide-react';

const Inventory: React.FC = () => {
  const { products, purchases, inventoryChecks, updateInventoryCheck, sales } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempStock, setTempStock] = useState<string>("");

  // CONSTANTS
  const GELINHO_NAME = "GELINHO";
  const MARKUP_MULTIPLIER = 2; // Assuming 100% markup for estimation (Cost * 2)

  // 1. Calculate Total Real Revenue (Cash + Pix from Sales)
  const totalRealRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  // 2. Separate Products
  const gelinhoProduct = products.find(p => p.name.toUpperCase().includes(GELINHO_NAME));
  const otherProducts = products.filter(p => !p.name.toUpperCase().includes(GELINHO_NAME));

  // 3. Process Other Products & Accumulate their Estimated Revenue
  let othersEstimatedRevenue = 0;

  const otherProductsData: ProductStatus[] = otherProducts.map(product => {
    const productPurchases = purchases.filter(p => p.productId === product.id);
    const totalPurchasedUnits = productPurchases.reduce((acc, p) => acc + (p.quantityPackages * product.unitsPerPackage), 0);
    const totalPurchasedCost = productPurchases.reduce((acc, p) => acc + p.totalCost, 0);

    // Current Stock (User Input)
    const check = inventoryChecks.find(c => c.productId === product.id);
    const currentStock = check ? check.currentStock : totalPurchasedUnits; // Default to full stock if not checked

    // Implied Sales
    const estimatedSalesUnits = Math.max(0, totalPurchasedUnits - currentStock);
    
    // Unit Sell Price Estimation
    const unitCost = product.unitsPerPackage > 0 ? product.packagePrice / product.unitsPerPackage : 0;
    const estimatedUnitSellPrice = unitCost * MARKUP_MULTIPLIER;
    
    const estimatedRevenue = estimatedSalesUnits * estimatedUnitSellPrice;
    othersEstimatedRevenue += estimatedRevenue;

    // Status Logic
    const averageDailySales = 1; // Simplification for demo
    const daysRemaining = averageDailySales > 0 ? currentStock / averageDailySales : 999;
    let status: 'Critical' | 'Low' | 'Good' | 'Overstock' = 'Good';
    if (currentStock === 0) status = 'Critical';
    else if (estimatedSalesUnits / totalPurchasedUnits > 0.8) status = 'Low'; // If sold > 80%

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

  // 4. Calculate Gelinho Logic (Residual)
  let gelinhoData: ProductStatus | null = null;

  if (gelinhoProduct) {
    const productPurchases = purchases.filter(p => p.productId === gelinhoProduct.id);
    const totalPurchasedUnits = productPurchases.reduce((acc, p) => acc + (p.quantityPackages * gelinhoProduct.unitsPerPackage), 0);
    const totalPurchasedCost = productPurchases.reduce((acc, p) => acc + p.totalCost, 0);

    const unitCost = gelinhoProduct.unitsPerPackage > 0 ? gelinhoProduct.packagePrice / gelinhoProduct.unitsPerPackage : 0;
    const estimatedUnitSellPrice = unitCost * MARKUP_MULTIPLIER;

    // The Magic Formula: Gelinho Revenue = Total Real Revenue - Others Revenue
    // If negative (Others estimated > Real), assume 0 for Gelinho
    const gelinhoRevenueTarget = Math.max(0, totalRealRevenue - othersEstimatedRevenue);

    // Back-calculate units sold: Revenue / Price
    const estimatedSalesUnits = estimatedUnitSellPrice > 0 ? Math.floor(gelinhoRevenueTarget / estimatedUnitSellPrice) : 0;

    // Back-calculate stock: Bought - Sold
    // Allow negative stock visually if revenue implies selling more than bought (data entry error in other products)
    const currentStock = totalPurchasedUnits - estimatedSalesUnits;

    gelinhoData = {
      product: gelinhoProduct,
      totalPurchasedUnits,
      totalPurchasedCost,
      estimatedSalesUnits,
      currentStock,
      averageDailySales: 0,
      daysRemaining: 0,
      status: currentStock <= 0 ? 'Critical' : 'Good'
    };
  }

  // 5. Merge and Sort
  const finalInventoryData = [...otherProductsData];
  if (gelinhoData) {
    // Put Gelinho at the top or bottom? Let's put it at the top for visibility
    finalInventoryData.unshift(gelinhoData);
  }

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
           <p className="text-slate-500 text-sm">
             O estoque do <strong>GELINHO</strong> é calculado automaticamente subtraindo o faturamento dos outros itens do Total de Vendas.
           </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg text-right">
             <span className="text-xs text-emerald-600 block uppercase font-bold">Vendas Totais (Caixa)</span>
             <span className="text-lg font-bold text-emerald-800">{formatCurrency(totalRealRevenue)}</span>
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
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {finalInventoryData.map((row) => {
              const isGelinho = row.product.name.toUpperCase().includes(GELINHO_NAME);
              const unitCost = row.product.unitsPerPackage > 0 ? row.product.packagePrice / row.product.unitsPerPackage : 0;
              const estimatedRevenue = row.estimatedSalesUnits * (unitCost * MARKUP_MULTIPLIER);

              return (
                <tr key={row.product.id} className={`hover:bg-slate-50 transition-colors group ${isGelinho ? 'bg-emerald-50/30' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 flex items-center">
                    {row.product.name}
                    {isGelinho && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full uppercase font-bold">Auto</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-center bg-blue-50/30 text-slate-600">{row.totalPurchasedUnits}</td>
                  
                  {/* Editable Stock Cell */}
                  <td 
                    className={`px-4 py-3 text-sm text-center border-x ${isGelinho ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : 'bg-yellow-50 border-yellow-100 cursor-pointer'}`} 
                    onClick={() => !isGelinho && !editingId && startEdit(row.product.id, row.currentStock)}
                  >
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
                             {isGelinho ? (
                                <div className="flex items-center text-slate-500" title="Calculado automaticamente via balanço">
                                    <Calculator size={14} className="mr-1"/>
                                    <span className="font-bold">{row.currentStock}</span>
                                </div>
                             ) : (
                                <>
                                    <span className="font-bold text-slate-800">{row.currentStock}</span>
                                    <PackageSearch size={14} className="text-slate-400 opacity-0 group-hover:opacity-100" />
                                </>
                             )}
                          </div>
                      )}
                  </td>

                  <td className="px-4 py-3 text-sm text-center bg-green-50/30 text-emerald-700 font-medium">
                      {row.estimatedSalesUnits}
                  </td>
                  <td className="px-4 py-3 text-sm text-center bg-green-50/30 text-emerald-700">
                      {formatCurrency(estimatedRevenue)}
                  </td>
                  <td className="px-4 py-3 text-center">
                      {row.status === 'Critical' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle size={12} className="mr-1"/> Crítico</span>}
                      {row.status === 'Low' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Baixo</span>}
                      {row.status === 'Good' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1"/> Ok</span>}
                      {row.status === 'Overstock' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Alto</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
