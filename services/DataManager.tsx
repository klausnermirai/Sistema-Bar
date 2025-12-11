
import React, { createContext, useContext, useState } from 'react';
import { Product, Purchase, SaleRecord, Expense, InventoryCheck, Supplier, User } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES, INITIAL_PURCHASES, INITIAL_SUPPLIERS, INITIAL_USERS } from '../constants';

interface DataContextType {
  products: Product[];
  purchases: Purchase[];
  sales: SaleRecord[];
  expenses: Expense[];
  inventoryChecks: InventoryCheck[];
  suppliers: Supplier[];
  users: User[];
  currentUser: User | null;
  
  // Data Actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addPurchase: (purchase: Purchase) => void;
  addSale: (sale: SaleRecord) => void;
  addExpense: (expense: Expense) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  updateInventoryCheck: (check: InventoryCheck) => void;
  getSummary: () => { totalRevenue: number; totalExpenses: number; totalPurchases: number; netResult: number };
  
  // Auth Actions
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [inventoryChecks, setInventoryChecks] = useState<InventoryCheck[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  
  // Auth State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const addProduct = (product: Product) => setProducts([...products, product]);
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addPurchase = (purchase: Purchase) => setPurchases([...purchases, purchase]);
  const addSale = (sale: SaleRecord) => setSales([...sales, sale]);
  const addExpense = (expense: Expense) => setExpenses([...expenses, expense]);
  
  const addSupplier = (supplier: Supplier) => setSuppliers([...suppliers, supplier]);
  
  const updateSupplier = (updatedSupplier: Supplier) => {
    const oldSupplier = suppliers.find(s => s.id === updatedSupplier.id);
    setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    if (oldSupplier && oldSupplier.name !== updatedSupplier.name) {
      setProducts(prevProducts => prevProducts.map(p => 
        p.supplier === oldSupplier.name ? { ...p, supplier: updatedSupplier.name } : p
      ));
    }
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

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

  // Auth Functions
  const login = (username: string, pass: string): boolean => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (user: User) => setUsers([...users, user]);
  
  const updateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If updating current user, update session
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };


  return (
    <DataContext.Provider value={{ 
      products, purchases, sales, expenses, inventoryChecks, suppliers, users, currentUser,
      addProduct, updateProduct, deleteProduct, 
      addPurchase, addSale, addExpense, 
      addSupplier, updateSupplier, deleteSupplier,
      updateInventoryCheck, getSummary,
      login, logout, addUser, updateUser, deleteUser
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