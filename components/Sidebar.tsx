import React from 'react';
import { LayoutDashboard, ShoppingCart, DollarSign, Package, TrendingUp, Settings, Beer } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Balanço Geral', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas (Caixa)', icon: TrendingUp },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'expenses', label: 'Despesas', icon: DollarSign },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex-shrink-0 flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
        <div className="bg-emerald-500 p-2 rounded-lg">
           <Beer size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-wider">BAR 2025</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 text-slate-400 hover:text-white cursor-pointer px-4 py-2">
          <Settings size={20} />
          <span>Configurações</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;