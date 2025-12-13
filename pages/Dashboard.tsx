
import React from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency, formatDate } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Wallet, CreditCard, FileText, ArrowDownCircle, ArrowUpCircle, Printer, PieChart } from 'lucide-react';

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
    <div className="space-y-8 pb-10 print:space-y-6 print:pb-0 print:block">
      
      {/* --- HEADER DE IMPRESSÃO (Formatado) --- */}
      <div className="hidden print:flex flex-col items-center justify-center border-b-2 border-black mb-8 pb-4 text-center">
         <h1 className="text-2xl font-bold text-black uppercase tracking-wide">Relatório de Gestão: {currentEvent?.name}</h1>
         <p className="text-sm text-gray-600 mt-1">Demonstrativo Financeiro e Controle de Estoque</p>
         <p className="text-xs text-gray-500 mt-1">Emissão: {new Date().toLocaleDateString()} às {new Date().toLocaleTimeString()}</p>
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

      {/* --- RESUMO FINANCEIRO (TELA: CARDS / IMPRESSÃO: TABELA) --- */}
      
      {/* Versão Tela (Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print:hidden">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Receita Total</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(summary.totalRevenue)}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Compras (Estoque)</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(summary.totalPurchases)}</h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Despesas Extras</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(summary.totalExpenses)}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border ${summary.netResult >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'} font-bold`}>Resultado Líquido</p>
              <h3 className={`text-2xl font-bold mt-2 ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatCurrency(summary.netResult)}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${summary.netResult >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
              {summary.netResult >= 0 ? <TrendingUp size={20} /> : <ArrowDownCircle size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Versão Impressão (Tabela Sintética) */}
      <div className="hidden print:block mb-8">
        <h3 className="font-bold text-lg mb-2 border-b border-black pb-1 uppercase">1. Resumo Financeiro</h3>
        <table className="w-full text-sm border-collapse border border-gray-400">
            <tbody>
                <tr className="border-b border-gray-300">
                    <td className="p-2 font-medium bg-gray-100 w-1/2"> (+) Receita Bruta (Vendas)</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(summary.totalRevenue)}</td>
                </tr>
                <tr className="border-b border-gray-300">
                    <td className="p-2 font-medium text-red-800 w-1/2"> (-) Custo de Mercadorias (Compras)</td>
                    <td className="p-2 text-right text-red-800">{formatCurrency(summary.totalPurchases)}</td>
                </tr>
                <tr className="border-b border-black">
                    <td className="p-2 font-medium text-red-800 w-1/2"> (-) Despesas Operacionais</td>
                    <td className="p-2 text-right text-red-800">{formatCurrency(summary.totalExpenses)}</td>
                </tr>
                <tr className="bg-gray-200">
                    <td className="p-3 font-bold uppercase text-black w-1/2"> (=) Resultado Líquido</td>
                    <td className="p-3 text-right font-bold text-lg text-black">{formatCurrency(summary.netResult)}</td>
                </tr>
            </tbody>
        </table>
      </div>

      {/* Charts Section - Hidden on Print */}
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

      {/* --- DETAILED REPORT TABLES --- */}
      <div className="pt-4 mt-8 print:mt-4 print:pt-0">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center print:hidden">
          <FileText className="mr-2" /> Demonstrativo Detalhado
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:grid-cols-1 print:gap-8 print:block">
          
          {/* 1. Daily Sales Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden print:border-0 print:shadow-none print:mb-6 print:break-inside-avoid">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center print:bg-transparent print:border-b-2 print:border-black print:px-0 print:mb-2">
              <h3 className="font-bold text-emerald-800 flex items-center print:text-black print:uppercase print:text-sm">
                2. Detalhamento de Receitas (Vendas)
              </h3>
            </div>
            {/* Remove max-height for print */}
            <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-sm print:text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 print:bg-gray-100 print:text-black print:font-bold">
                    <tr>
                    <th className="px-4 py-2 text-left print:border print:border-gray-400">Data</th>
                    <th className="px-4 py-2 text-right print:border print:border-gray-400">Dinheiro</th>
                    <th className="px-4 py-2 text-right print:border print:border-gray-400">PIX</th>
                    <th className="px-4 py-2 text-right font-bold print:border print:border-gray-400">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                    {sales.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(s => (
                    <tr key={s.id}>
                        <td className="px-4 py-2 text-slate-700 print:text-black print:border print:border-gray-400">{formatDate(s.date)}</td>
                        <td className="px-4 py-2 text-right text-slate-600 print:text-black print:border print:border-gray-400">{formatCurrency(s.amountCash)}</td>
                        <td className="px-4 py-2 text-right text-slate-600 print:text-black print:border print:border-gray-400">{formatCurrency(s.amountPix)}</td>
                        <td className="px-4 py-2 text-right font-bold text-emerald-700 print:text-black print:border print:border-gray-400">{formatCurrency(s.total)}</td>
                    </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-800 print:bg-gray-200 print:text-black">
                    <tr>
                    <td className="px-4 py-2 print:border print:border-gray-400">TOTAL</td>
                    <td className="px-4 py-2 text-right print:border print:border-gray-400">{formatCurrency(sales.reduce((acc,s) => acc + s.amountCash, 0))}</td>
                    <td className="px-4 py-2 text-right print:border print:border-gray-400">{formatCurrency(sales.reduce((acc,s) => acc + s.amountPix, 0))}</td>
                    <td className="px-4 py-2 text-right print:border print:border-gray-400">{formatCurrency(summary.totalRevenue)}</td>
                    </tr>
                </tfoot>
                </table>
            </div>
          </div>

          {/* 2. Expenses Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden print:border-0 print:shadow-none print:mb-6 print:break-inside-avoid">
             <div className="bg-red-50 px-4 py-3 border-b border-red-100 flex justify-between items-center print:bg-transparent print:border-b-2 print:border-black print:px-0 print:mb-2">
              <h3 className="font-bold text-red-800 flex items-center print:text-black print:uppercase print:text-sm">
                3. Detalhamento de Despesas
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[300px] print:max-h-full print:overflow-visible">
              <table className="w-full text-sm print:text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 sticky top-0 print:static print:bg-gray-100 print:text-black print:font-bold">
                  <tr>
                    <th className="px-4 py-2 text-left print:border print:border-gray-400">Descrição</th>
                    <th className="px-4 py-2 text-left print:border print:border-gray-400">Categ.</th>
                    <th className="px-4 py-2 text-right print:border print:border-gray-400">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-gray-300">
                  {expenses.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(e => (
                    <tr key={e.id}>
                      <td className="px-4 py-2 text-slate-700 truncate max-w-[150px] print:whitespace-normal print:max-w-none print:text-black print:border print:border-gray-400">{e.description}</td>
                      <td className="px-4 py-2 text-slate-500 text-xs print:text-black print:border print:border-gray-400">{e.category}</td>
                      <td className="px-4 py-2 text-right text-red-600 print:text-black print:border print:border-gray-400">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-800 sticky bottom-0 print:static print:bg-gray-200 print:text-black">
                  <tr>
                    <td className="px-4 py-2 print:border print:border-gray-400" colSpan={2}>TOTAL DESPESAS</td>
                    <td className="px-4 py-2 text-right text-red-700 print:text-black print:border print:border-gray-400">{formatCurrency(summary.totalExpenses)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Consolidated Purchases Table (By Product) */}
        <div className="mt-8 bg-white rounded-lg border border-slate-200 overflow-hidden print:border-0 print:shadow-none print:mt-6 print:break-inside-avoid">
          <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center print:bg-transparent print:border-b-2 print:border-black print:px-0 print:mb-2">
            <h3 className="font-bold text-amber-800 flex items-center print:text-black print:uppercase print:text-sm">
                4. Custos de Mercadoria (Compras Consolidadas)
            </h3>
          </div>
          <table className="w-full text-sm print:text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 print:bg-gray-100 print:text-black print:font-bold">
              <tr>
                <th className="px-4 py-2 text-left print:border print:border-gray-400">Produto</th>
                <th className="px-4 py-2 text-right print:border print:border-gray-400">Total Un/Pct</th>
                <th className="px-4 py-2 text-right print:border print:border-gray-400">Preço Médio</th>
                <th className="px-4 py-2 text-right font-bold print:border print:border-gray-400">Custo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-gray-300">
              {consolidatedPurchases.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-slate-700 font-medium print:text-black print:border print:border-gray-400">{item.name}</td>
                  <td className="px-4 py-2 text-right text-slate-600 print:text-black print:border print:border-gray-400">{item.totalQty} {item.measureUnit}s</td>
                  <td className="px-4 py-2 text-right text-slate-500 print:text-black print:border print:border-gray-400">{formatCurrency(item.avgPrice)}</td>
                  <td className="px-4 py-2 text-right font-bold text-amber-700 print:text-black print:border print:border-gray-400">{formatCurrency(item.totalCost)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-800 print:bg-gray-200 print:text-black">
              <tr>
                <td className="px-4 py-2 print:border print:border-gray-400" colSpan={3}>TOTAL GERAL DE COMPRAS</td>
                <td className="px-4 py-2 text-right text-amber-700 print:text-black print:border print:border-gray-400">{formatCurrency(summary.totalPurchases)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* PRINT SIGNATURE FOOTER */}
        <div className="hidden print:flex mt-16 pt-8 justify-between px-10">
            <div className="text-center">
                <div className="w-64 border-t border-black mb-2"></div>
                <p className="text-sm font-medium uppercase">Responsável Financeiro</p>
            </div>
            <div className="text-center">
                <div className="w-64 border-t border-black mb-2"></div>
                <p className="text-sm font-medium uppercase">Conferência / Gerência</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
