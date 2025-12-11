import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Purchase, SaleRecord, Expense, InventoryCheck } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES, INITIAL_PURCHASES } from '../constants';

interface DataContextType {
  products: Product[];
  purchases: Purchase[];
  sales: SaleRecord[];
  expenses: Expense[];
  inventoryChecks: InventoryCheck[];
  addProduct: (product: Product) => void;
  addPurchase: (purchase: Purchase) => void;
  addSale: (sale: SaleRecord) => void;
  addExpense: (expense: Expense) => void;
  updateInventoryCheck: (check: InventoryCheck) => void;
  getSummary: () => { totalRevenue: number; totalExpenses: number; totalPurchases: number; netResult: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, these would load from an API or LocalStorage
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [inventoryChecks, setInventoryChecks] = useState<InventoryCheck[]>([]);

  const addProduct = (product: Product) => setProducts([...products, product]);
  const addPurchase = (purchase: Purchase) => setPurchases([...purchases, purchase]);
  const addSale = (sale: SaleRecord) => setSales([...sales, sale]);
  const addExpense = (expense: Expense) => setExpenses([...expenses, expense]);
  
  const updateInventoryCheck = (check: InventoryCheck) => {
    setInventoryChecks(prev => {
      const existing = prev.filter(p => p.productId !== check.productId);
      return [...existing, check];
    });
  };

  const getSummary = () => {
    const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPurchases = purchases.reduce((acc, curr) => acc + curr.totalCost, 0);
    const netResult = totalRevenue - totalExpenses - totalPurchases;

    return { totalRevenue, totalExpenses, totalPurchases, netResult };
  };

  return (
    <DataContext.Provider value={{ 
      products, purchases, sales, expenses, inventoryChecks,
      addProduct, addPurchase, addSale, addExpense, updateInventoryCheck, getSummary
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};