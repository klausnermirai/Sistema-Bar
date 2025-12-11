
import React from 'react';
import { LayoutDashboard, ShoppingCart, DollarSign, Package, TrendingUp, Settings, Beer, Tag, Truck, LogOut } from 'lucide-react';
import { useData } from '../services/DataManager';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout, currentUser } = useData();

  const menuItems = [
    { id: 'dashboard', label: 'Balanço Geral', icon: LayoutDashboard },
    { id: 'sales', label: 'Vendas (Caixa)', icon: TrendingUp },
    { id: 'products', label: 'Produtos', icon: Tag },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    { id: 'purchases', label: 'Compras', icon: ShoppingCart },
    { id: 'inventory', label: 'Estoque', icon: Package },
    { id: 'expenses', label: 'Despesas', icon: DollarSign },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex-shrink-0 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
        <div className="bg-emerald-500 p-2 rounded-lg">
           <Beer size={24} className="text-white" />
        </div>
        <div>
           <h1 className="text-xl font-bold tracking-wider">BAR 2025</h1>
           <p className="text-xs text-slate-400">Olá, {currentUser?.name.split(' ')[0]}</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

      <div className="p-4 border-t border-slate-700 space-y-2">
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </button>
        
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
