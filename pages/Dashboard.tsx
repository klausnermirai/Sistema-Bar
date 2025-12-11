import React from 'react';
import { useData } from '../services/DataManager';
import { formatCurrency } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { getSummary, sales, expenses, purchases } = useData();
  const summary = getSummary();

  // Prepare data for charts
  const salesData = sales.map(s => ({
    date: new Date(s.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    Total: s.total,
    Dinheiro: s.amountCash,
    PIX: s.amountPix
  }));

  // Simple aggregation for financial flow
  const financialFlow = [
    { name: 'Entradas', amount: summary.totalRevenue, fill: '#10b981' },
    { name: 'Saídas (Compras)', amount: summary.totalPurchases, fill: '#f59e0b' },
    { name: 'Despesas', amount: summary.totalExpenses, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Balanço do Evento</h2>
        <span className="text-sm text-slate-500">Última atualização: Hoje</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <p className="text-xs text-slate-400 mt-2">Vendas brutas</p>
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
          <p className="text-xs text-slate-400 mt-2">Custo de mercadoria</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Despesas Operacionais</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(summary.totalExpenses)}</h3>
            </div>
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Custos fixos e extras</p>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border ${summary.netResult >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Resultado Líquido</p>
              <h3 className={`text-2xl font-bold mt-2 ${summary.netResult >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatCurrency(summary.netResult)}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${summary.netResult >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'}`}>
              <TrendingUp size={20} />
            </div>
          </div>
          <p className={`text-xs mt-2 ${summary.netResult >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            Lucro/Prejuízo Real
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Evolução das Vendas (Diário)</h3>
          <div className="h-72">
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
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Fluxo Financeiro</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialFlow} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: 'transparent'}} />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;