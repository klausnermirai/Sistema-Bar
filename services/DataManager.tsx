
import React, { createContext, useContext, useState } from 'react';
import { Product, Purchase, SaleRecord, Expense, InventoryCheck, Supplier, User, Event } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES, INITIAL_PURCHASES, INITIAL_SUPPLIERS, INITIAL_USERS, INITIAL_EVENTS } from '../constants';

interface DataContextType {
  // Global Data
  products: Product[];
  suppliers: Supplier[];
  users: User[];
  events: Event[];
  
  // Scoped Data (Filtered by Current Event)
  purchases: Purchase[];
  sales: SaleRecord[];
  expenses: Expense[];
  inventoryChecks: InventoryCheck[];
  
  // State
  currentUser: User | null;
  currentEvent: Event | null;
  
  // Global Actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  
  // Event Actions
  selectEvent: (eventId: string) => void;
  addEvent: (event: Event) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  exitEvent: () => void;

  // Scoped Actions (Automatically attaches currentEvent ID)
  addPurchase: (purchase: Omit<Purchase, 'eventId'>) => void;
  addSale: (sale: Omit<SaleRecord, 'eventId'>) => void;
  addExpense: (expense: Omit<Expense, 'eventId'>) => void;
  updateInventoryCheck: (check: Omit<InventoryCheck, 'eventId'>) => void;
  
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
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  
  // All transactions (stored together, filtered on export)
  const [allPurchases, setAllPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [allSales, setAllSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [allExpenses, setAllExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [allInventoryChecks, setAllInventoryChecks] = useState<InventoryCheck[]>([]);
  
  // Auth & Event State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Derived State (Helpers)
  const currentEvent = events.find(e => e.id === currentEventId) || null;

  const purchases = allPurchases.filter(p => p.eventId === currentEventId);
  const sales = allSales.filter(s => s.eventId === currentEventId);
  const expenses = allExpenses.filter(e => e.eventId === currentEventId);
  const inventoryChecks = allInventoryChecks.filter(i => i.eventId === currentEventId);

  // --- ACTIONS ---

  const addProduct = (product: Product) => setProducts([...products, product]);
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

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

  // --- EVENT MANAGEMENT ---
  const selectEvent = (eventId: string) => setCurrentEventId(eventId);
  const exitEvent = () => setCurrentEventId(null);
  
  const addEvent = (event: Event) => setEvents([...events, event]);
  const updateEvent = (event: Event) => setEvents(events.map(e => e.id === event.id ? event : e));
  const deleteEvent = (id: string) => {
    if(currentEventId === id) setCurrentEventId(null);
    setEvents(events.filter(e => e.id !== id));
    // Optional: Cleanup data associated with event
    setAllSales(prev => prev.filter(i => i.eventId !== id));
    setAllPurchases(prev => prev.filter(i => i.eventId !== id));
    setAllExpenses(prev => prev.filter(i => i.eventId !== id));
    setAllInventoryChecks(prev => prev.filter(i => i.eventId !== id));
  };

  // --- SCOPED TRANSACTION ACTIONS ---
  // Note: We cast inputs to Omit<T, 'eventId'> so components don't worry about IDs
  
  const addPurchase = (purchase: Omit<Purchase, 'eventId'>) => {
    if (!currentEventId) return;
    setAllPurchases([...allPurchases, { ...purchase, eventId: currentEventId }]);
  };

  const addSale = (sale: Omit<SaleRecord, 'eventId'>) => {
    if (!currentEventId) return;
    setAllSales([...allSales, { ...sale, eventId: currentEventId }]);
  };

  const addExpense = (expense: Omit<Expense, 'eventId'>) => {
    if (!currentEventId) return;
    setAllExpenses([...allExpenses, { ...expense, eventId: currentEventId }]);
  };

  const updateInventoryCheck = (check: Omit<InventoryCheck, 'eventId'>) => {
    if (!currentEventId) return;
    setAllInventoryChecks(prev => {
      const existing = prev.filter(p => !(p.productId === check.productId && p.eventId === currentEventId));
      return [...existing, { ...check, eventId: currentEventId }];
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
    setCurrentEventId(null);
  };

  const addUser = (user: User) => setUsers([...users, user]);
  
  const updateUser = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };


  return (
    <DataContext.Provider value={{ 
      products, suppliers, users, events,
      purchases, sales, expenses, inventoryChecks,
      currentUser, currentEvent,
      addProduct, updateProduct, deleteProduct, 
      addPurchase, addSale, addExpense, 
      addSupplier, updateSupplier, deleteSupplier,
      updateInventoryCheck, getSummary,
      login, logout, addUser, updateUser, deleteUser,
      selectEvent, addEvent, updateEvent, deleteEvent, exitEvent
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
