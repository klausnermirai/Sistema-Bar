
import React from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, formatDate } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Wallet, CreditCard, FileText, ArrowDownCircle, ArrowUpCircle, Printer } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { getSummary, sales, expenses, purchases, products, currentEvent } = useData();
  const summary = getSummary();

  // 1. Prepare Chart Data
  const salesData = sales
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => ({
      date: new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Total: s.total,
      Dinheiro: s.amountCash,
      PIX: s.amountPix
    }));

  const financialFlow = [
    { name: 'Entradas', amount: summary.totalRevenue, fill: '#10b981' },
    { name: 'Saídas (Compras)', amount: summary.totalPurchases, fill: '#f59e0b' },
    { name: 'Despesas', amount: summary.totalExpenses, fill: '#ef4444' },
  ];

  // 2. Prepare Consolidated Purchases Data (By Item)
  const consolidatedPurchases = products.map(product => {
    const productPurchases = purchases.filter(p => p.productId === product.id);
    const totalQty = productPurchases.reduce((acc, p) => acc + p.quantityPackages, 0);
    const totalCost = productPurchases.reduce((acc, p) => acc + p.totalCost, 0);
    
    return {
      id: product.id,
      name: product.name,
      measureUnit: product.measureUnit,
      totalQty,
      totalCost,
      avgPrice: totalQty > 0 ? totalCost / totalQty : 0
    };
  }).filter(item => item.totalCost > 0).sort((a,b) => b.totalCost - a.totalCost);

  return (
    <div className="space-y-8 pb-10 print:space-y-4 print:pb-0">
      
      {/* PRINT ONLY HEADER */}
      <div className="hidden print:block border-b-2 border-slate-800 mb-6 pb-4">
         <h1 className="text-3xl font-bold text-slate-900 uppercase">Relatório Financeiro: {currentEvent?.name}</h1>
         <div className="flex justify-between items-end mt-2">
            <p className="text-sm text-slate-600">Balanço Geral e Demonstrativo de Resultados</p>
            <p className="text-xs text-slate-500">Gerado em: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
         </div>
      </div>

      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-slate-800">Painel Financeiro & Balancete</h2>
        <button 
          onClick={() => window.print()}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Printer size={18} />
          <span>Imprimir Relatório</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-4 print:gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-slate-300 print:shadow-none print:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 print:text-slate-600">Receita Total</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2 print:text-black">{formatCurrency(summary.totalRevenue)}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 print:hidden">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-slate-300 print:shadow-none print:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 print:text-slate-600">Compras (Estoque)</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-2 print:text-black">{formatCurrency(summary.totalPurchases)}</h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 print:hidden">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:border-slate-300 print:shadow-none print:p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 print:text-slate-600">Despesas Extras</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2 print:text-black">{formatCurrency(summary.totalExpenses)}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600 print:hidden">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border ${summary.netResult >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} print:bg-white print:border-slate-800 print:shadow-none print:p-4`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'} print:text-slate-800 font-bold`}>Resultado Líquido</p>
              <h3 className={`text-2xl font-bold mt-2 ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'} print:text-black`}>
                {formatCurrency(summary.netResult)}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${summary.netResult >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'} print:hidden`}>
              {summary.netResult >= 0 ? <TrendingUp size={20} /> : <ArrowDownCircle size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Hidden on Print to save space/ink */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Fluxo de Vendas (Diário)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Area type="monotone" dataKey="Total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Comparativo Financeiro</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialFlow} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={30} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* DETAILED REPORT TABLES */}
      <div className="border-t-2 border-slate-200 pt-8 mt-8 print:border-t-0 print:mt-4 print:pt-0">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center print:text-lg print:mb-2 print:uppercase print:text-black">
          <FileText className="mr-2 print:hidden" /> Demonstrativo Detalhado
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1 print:gap-6 print:block">
          
          {/* 1. Daily Sales Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden print:mb-6 print:border-slate-400 print:shadow-none">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center print:bg-slate-100 print:border-slate-300">
              <h3 className="font-bold text-emerald-800 flex items-center print:text-black"><ArrowUpCircle size={16} className="mr-2 print:hidden"/> Vendas Dia a Dia</h3>
              <span className="text-xs font-semibold bg-white text-emerald-700 px-2 py-1 rounded border border-emerald-200 print:hidden">Receitas</span>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 print:bg-white print:text-black print:border-b print:border-slate-300">
                <tr>
                  <th className="px-4 py-2 text-left">Data</th>
                  <th className="px-4 py-2 text-right">Dinheiro</th>
                  <th className="px-4 py-2 text-right">PIX</th>
                  <th className="px-4 py-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {sales.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(s => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 text-slate-700 print:text-black">{formatDate(s.date)}</td>
                    <td className="px-4 py-2 text-right text-slate-600 print:text-black">{formatCurrency(s.amountCash)}</td>
                    <td className="px-4 py-2 text-right text-slate-600 print:text-black">{formatCurrency(s.amountPix)}</td>
                    <td className="px-4 py-2 text-right font-bold text-emerald-700 print:text-black">{formatCurrency(s.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-800 print:bg-slate-50 print:border-t print:border-slate-300">
                <tr>
                  <td className="px-4 py-2">TOTAL</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(sales.reduce((acc,s) => acc + s.amountCash, 0))}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(sales.reduce((acc,s) => acc + s.amountPix, 0))}</td>
                  <td className="px-4 py-2 text-right text-emerald-700 print:text-black">{formatCurrency(summary.totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 2. Expenses Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden print:mb-6 print:border-slate-400 print:shadow-none print:break-inside-avoid">
             <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center print:bg-slate-100 print:border-slate-300">
              <h3 className="font-bold text-red-800 flex items-center print:text-black"><ArrowDownCircle size={16} className="mr-2 print:hidden"/> Despesas Operacionais</h3>
              <span className="text-xs font-semibold bg-white text-red-700 px-2 py-1 rounded border border-red-200 print:hidden">Saídas</span>
            </div>
            {/* Remove max-height and overflow for print so entire list prints */}
            <div className="overflow-y-auto max-h-[300px] print:max-h-full print:overflow-visible">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 print:static print:bg-white print:text-black print:border-b print:border-slate-300">
                  <tr>
                    <th className="px-4 py-2 text-left">Descrição</th>
                    <th className="px-4 py-2 text-left">Categ.</th>
                    <th className="px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                  {expenses.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(e => (
                    <tr key={e.id}>
                      <td className="px-4 py-2 text-slate-700 truncate max-w-[150px] print:whitespace-normal print:max-w-none print:text-black">{e.description}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs print:text-black">{e.category}</td>
                      <td className="px-4 py-2 text-right text-red-600 print:text-black">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-800 sticky bottom-0 print:static print:bg-slate-50 print:border-t print:border-slate-300">
                  <tr>
                    <td className="px-4 py-2" colSpan={2}>TOTAL DESPESAS</td>
                    <td className="px-4 py-2 text-right text-red-700 print:text-black">{formatCurrency(summary.totalExpenses)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Consolidated Purchases Table (By Product) */}
        <div className="mt-8 bg-white rounded-lg border border-slate-200 overflow-hidden print:mt-6 print:border-slate-400 print:break-inside-avoid">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center print:bg-slate-100 print:border-slate-300">
            <h3 className="font-bold text-amber-800 flex items-center print:text-black"><Wallet size={16} className="mr-2 print:hidden"/> Compras por Item (Consolidado)</h3>
            <span className="text-xs font-semibold bg-white text-amber-700 px-2 py-1 rounded border border-amber-200 print:hidden">Custo de Mercadoria</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 print:bg-white print:text-black print:border-b print:border-slate-300">
              <tr>
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-right">Total Embalagens</th>
                <th className="px-4 py-2 text-right">Preço Médio (Pct)</th>
                <th className="px-4 py-2 text-right font-bold">Custo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {consolidatedPurchases.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-medium print:text-black">{item.name}</td>
                  <td className="px-4 py-2 text-right text-slate-600 print:text-black">{item.totalQty} {item.measureUnit}s</td>
                  <td className="px-4 py-2 text-right text-slate-500 print:text-black">{formatCurrency(item.avgPrice)}</td>
                  <td className="px-4 py-2 text-right font-bold text-amber-700 print:text-black">{formatCurrency(item.totalCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-800 print:bg-slate-50 print:border-t print:border-slate-300">
              <tr>
                <td className="px-4 py-2" colSpan={3}>TOTAL GERAL DE COMPRAS</td>
                <td className="px-4 py-2 text-right text-amber-700 print:text-black">{formatCurrency(summary.totalPurchases)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4. FINAL RESULT ROW */}
        <div className="mt-8 bg-slate-800 text-white rounded-xl p-6 flex flex-col md:flex-row justify-between items-center shadow-lg print:bg-white print:text-black print:border-2 print:border-slate-900 print:shadow-none print:mt-6 print:break-inside-avoid">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h3 className="text-lg uppercase tracking-widest opacity-80 print:opacity-100 print:font-bold">Resultado Operacional Final</h3>
            <p className="text-xs opacity-60 print:hidden">Receitas - (Despesas + Compras)</p>
          </div>
          <div className={`text-3xl md:text-4xl font-bold ${summary.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'} print:text-black`}>
             {formatCurrency(summary.netResult)}
          </div>
        </div>

        {/* PRINT SIGNATURE FOOTER */}
        <div className="hidden print:flex mt-16 pt-8 justify-around">
            <div className="text-center">
                <div className="w-64 border-t border-black mb-2"></div>
                <p className="text-sm font-medium uppercase">Responsável Financeiro</p>
            </div>
            <div className="text-center">
                <div className="w-64 border-t border-black mb-2"></div>
                <p className="text-sm font-medium uppercase">Conferência</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
