
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Purchase, SaleRecord, Expense, InventoryCheck, Supplier, User, Event } from '../types';
import { supabase } from './supabaseClient';
import { INITIAL_USERS } from '../constants'; // Fallback & Seeding

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
  isLoading: boolean;
  connectionError: string | null;
  
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
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // All transactions (stored together, filtered on export)
  const [allPurchases, setAllPurchases] = useState<Purchase[]>([]);
  const [allSales, setAllSales] = useState<SaleRecord[]>([]);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allInventoryChecks, setAllInventoryChecks] = useState<InventoryCheck[]>([]);
  
  // Auth & Event State
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Derived State (Helpers)
  const currentEvent = events.find(e => e.id === currentEventId) || null;

  const purchases = allPurchases.filter(p => p.eventId === currentEventId);
  const sales = allSales.filter(s => s.eventId === currentEventId);
  const expenses = allExpenses.filter(e => e.eventId === currentEventId);
  const inventoryChecks = allInventoryChecks.filter(i => i.eventId === currentEventId);

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      // 1. Users - Check and Seed if necessary
      let { data: usersData, error: usersError } = await supabase.from('users').select('*');
      
      if (usersError) throw usersError;

      // SEEDING: If table is empty, insert default admin
      if (!usersData || usersData.length === 0) {
        console.log("Banco de dados vazio. Criando usuários padrão...");
        const { error: seedError } = await supabase.from('users').insert(INITIAL_USERS);
        if (!seedError) {
            usersData = INITIAL_USERS;
        } else {
            console.error("Erro ao popular usuários iniciais:", seedError);
        }
      }
      setUsers(usersData || []);

      // 2. Fetch other entities
      const { data: eventsData } = await supabase.from('events').select('*');
      const { data: prodData } = await supabase.from('products').select('*');
      const { data: suppData } = await supabase.from('suppliers').select('*');
      const { data: salesData } = await supabase.from('sales').select('*');
      const { data: expData } = await supabase.from('expenses').select('*');
      const { data: purData } = await supabase.from('purchases').select('*');
      const { data: invData } = await supabase.from('inventory_checks').select('*');

      if (eventsData) setEvents(eventsData);
      if (prodData) setProducts(prodData);
      if (suppData) setSuppliers(suppData);
      if (salesData) setAllSales(salesData);
      if (expData) setAllExpenses(expData);
      if (purData) setAllPurchases(purData);
      if (invData) setAllInventoryChecks(invData);

    } catch (error: any) {
      console.error("Error loading data from Supabase:", error);
      setConnectionError(error.message || "Erro de conexão");
      // Fallback for demo purposes if DB completely fails
      setUsers(INITIAL_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS (Optimistic Updates + Supabase) ---

  const addProduct = async (product: Product) => {
    setProducts([...products, product]); // Optimistic
    const { error } = await supabase.from('products').insert(product);
    if(error) console.error(error);
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
    if(error) console.error(error);
  };

  const deleteProduct = async (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error) console.error(error);
  };

  const addSupplier = async (supplier: Supplier) => {
    setSuppliers([...suppliers, supplier]);
    const { error } = await supabase.from('suppliers').insert(supplier);
    if(error) console.error(error);
  };
  
  const updateSupplier = async (updatedSupplier: Supplier) => {
    const oldSupplier = suppliers.find(s => s.id === updatedSupplier.id);
    setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
    const { error } = await supabase.from('suppliers').update(updatedSupplier).eq('id', updatedSupplier.id);
    if(error) console.error(error);
    
    // Update related products locally
    if (oldSupplier && oldSupplier.name !== updatedSupplier.name) {
      setProducts(prevProducts => prevProducts.map(p => 
        p.supplier === oldSupplier.name ? { ...p, supplier: updatedSupplier.name } : p
      ));
    }
  };

  const deleteSupplier = async (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if(error) console.error(error);
  };

  // --- EVENT MANAGEMENT ---
  const selectEvent = (eventId: string) => setCurrentEventId(eventId);
  const exitEvent = () => setCurrentEventId(null);
  
  const addEvent = async (event: Event) => {
    setEvents([...events, event]);
    const { error } = await supabase.from('events').insert(event);
    if(error) console.error(error);
  };

  const updateEvent = async (event: Event) => {
    setEvents(events.map(e => e.id === event.id ? event : e));
    const { error } = await supabase.from('events').update(event).eq('id', event.id);
    if(error) console.error(error);
  };

  const deleteEvent = async (id: string) => {
    if(currentEventId === id) setCurrentEventId(null);
    setEvents(events.filter(e => e.id !== id));
    setAllSales(prev => prev.filter(i => i.eventId !== id));
    setAllPurchases(prev => prev.filter(i => i.eventId !== id));
    setAllExpenses(prev => prev.filter(i => i.eventId !== id));
    setAllInventoryChecks(prev => prev.filter(i => i.eventId !== id));
    
    // If SQL has ON DELETE CASCADE, this single call deletes everything related
    const { error } = await supabase.from('events').delete().eq('id', id);
    if(error) console.error(error);
  };

  // --- SCOPED TRANSACTION ACTIONS ---
  
  const addPurchase = async (purchase: Omit<Purchase, 'eventId'>) => {
    if (!currentEventId) return;
    const fullPurchase = { ...purchase, eventId: currentEventId };
    setAllPurchases([...allPurchases, fullPurchase]);
    const { error } = await supabase.from('purchases').insert(fullPurchase);
    if(error) console.error(error);
  };

  const addSale = async (sale: Omit<SaleRecord, 'eventId'>) => {
    if (!currentEventId) return;
    const fullSale = { ...sale, eventId: currentEventId };
    setAllSales([...allSales, fullSale]);
    const { error } = await supabase.from('sales').insert(fullSale);
    if(error) console.error(error);
  };

  const addExpense = async (expense: Omit<Expense, 'eventId'>) => {
    if (!currentEventId) return;
    const fullExpense = { ...expense, eventId: currentEventId };
    setAllExpenses([...allExpenses, fullExpense]);
    const { error } = await supabase.from('expenses').insert(fullExpense);
    if(error) console.error(error);
  };

  const updateInventoryCheck = async (check: Omit<InventoryCheck, 'eventId'>) => {
    if (!currentEventId) return;
    const fullCheck = { ...check, eventId: currentEventId };
    
    setAllInventoryChecks(prev => {
      // Remove previous check for this specific product in this event
      const existing = prev.filter(p => !(p.productId === check.productId && p.eventId === currentEventId));
      return [...existing, fullCheck];
    });

    // Uses the Composite Primary Key (productId, eventId) defined in SQL to perform upsert
    const { error } = await supabase.from('inventory_checks').upsert(fullCheck);
    if(error) console.error(error);
  };

  const getSummary = () => {
    const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalPurchases = purchases.reduce((acc, curr) => acc + curr.totalCost, 0);
    const netResult = totalRevenue - totalExpenses - totalPurchases;

    return { totalRevenue, totalExpenses, totalPurchases, netResult };
  };

  // Auth Functions
  const login = async (username: string, pass: string): Promise<boolean> => {
    // Refresh users to ensure we have latest data
    const { data: latestUsers } = await supabase.from('users').select('*');
    const sourceUsers = latestUsers || users;
    
    if (latestUsers) setUsers(latestUsers);

    const user = sourceUsers.find(u => u.username === username && u.password === pass);
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

  const addUser = async (user: User) => {
    setUsers([...users, user]);
    const { error } = await supabase.from('users').insert(user);
    if(error) console.error(error);
  };
  
  const updateUser = async (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    const { error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    if(error) console.error(error);
  };

  const deleteUser = async (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    const { error } = await supabase.from('users').delete().eq('id', id);
    if(error) console.error(error);
  };


  return (
    <DataContext.Provider value={{ 
      products, suppliers, users, events,
      purchases, sales, expenses, inventoryChecks,
      currentUser, currentEvent, isLoading, connectionError,
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
