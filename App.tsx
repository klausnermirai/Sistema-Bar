
import React, { useState } from 'react';
import { DataProvider, useData } from './services/DataManager';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Expenses from './pages/Expenses';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Suppliers from './pages/Suppliers';
import Settings from './pages/Settings';
import Login from './pages/Login';
import EventSelection from './pages/EventSelection';

const AppContent: React.FC = () => {
  const { currentUser, currentEvent } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  if (!currentEvent) {
    return <EventSelection />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'sales': return <Sales />;
      case 'products': return <Products />;
      case 'suppliers': return <Suppliers />;
      case 'purchases': return <Purchases />;
      case 'expenses': return <Expenses />;
      case 'inventory': return <Inventory />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
