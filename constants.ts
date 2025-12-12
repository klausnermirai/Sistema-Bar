
import { Product, Purchase, SaleRecord, Expense, Supplier, User, Event } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Administrador', username: 'admin', password: 'admin123', role: 'admin' }
];

export const INITIAL_EVENTS: Event[] = [
  { id: 'ev1', name: 'BAR 2025', date: '2025-01-01', status: 'active' }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'sup1', name: 'LUIS DOCE', contact: '(11) 99999-9999' },
  { id: 'sup2', name: 'GARATINI', contact: '' },
  { id: 'sup3', name: 'PLASFER', contact: '' },
  { id: 'sup4', name: 'MERCADO EXTRA', contact: '' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'GELINHO', measureUnit: 'Cx', packagePrice: 83.40, unitsPerPackage: 240, supplier: 'LUIS DOCE', unitCost: 0.35, category: 'Doces' },
  { id: '2', name: 'HALLS PRETO', measureUnit: 'Cx', packagePrice: 26.90, unitsPerPackage: 21, supplier: 'LUIS DOCE', unitCost: 1.28, category: 'Doces' },
  { id: '3', name: 'HALLS MORANGO', measureUnit: 'Cx', packagePrice: 26.90, unitsPerPackage: 21, supplier: 'LUIS DOCE', unitCost: 1.28, category: 'Doces' },
  { id: '4', name: 'TRIDENT VERDE', measureUnit: 'Cx', packagePrice: 38.90, unitsPerPackage: 21, supplier: 'LUIS DOCE', unitCost: 1.85, category: 'Doces' },
  { id: '5', name: 'TRIDENT PRETO', measureUnit: 'Cx', packagePrice: 38.90, unitsPerPackage: 21, supplier: 'LUIS DOCE', unitCost: 1.85, category: 'Doces' },
  { id: '6', name: 'MENDORATO', measureUnit: 'Pct', packagePrice: 42.00, unitsPerPackage: 60, supplier: 'LUIS DOCE', unitCost: 0.70, category: 'Salgados' },
  { id: '7', name: 'AGUA MINERAL', measureUnit: 'Fardo', packagePrice: 1.00, unitsPerPackage: 1, supplier: 'GARATINI', unitCost: 1.00, category: 'Bebidas' },
  { id: '8', name: 'COCA COLA', measureUnit: 'Fardo', packagePrice: 3.49, unitsPerPackage: 1, supplier: 'GARATINI', unitCost: 3.49, category: 'Bebidas' },
  { id: '9', name: 'COCA COLA ZERO', measureUnit: 'Fardo', packagePrice: 3.99, unitsPerPackage: 1, supplier: 'GARATINI', unitCost: 3.99, category: 'Bebidas' },
  { id: '10', name: 'GUARANA ANTARTICA', measureUnit: 'Fardo', packagePrice: 3.49, unitsPerPackage: 1, supplier: 'GARATINI', unitCost: 3.49, category: 'Bebidas' },
];

export const INITIAL_SALES: SaleRecord[] = [
  { id: 's1', eventId: 'ev1', date: '2025-01-08', amountCash: 521.50, amountPix: 535.00, total: 1056.50 },
  { id: 's2', eventId: 'ev1', date: '2025-01-09', amountCash: 522.10, amountPix: 504.00, total: 1026.10 },
  { id: 's3', eventId: 'ev1', date: '2025-01-10', amountCash: 433.20, amountPix: 444.00, total: 877.20 },
  { id: 's4', eventId: 'ev1', date: '2025-01-11', amountCash: 320.50, amountPix: 397.50, total: 718.00 },
  { id: 's5', eventId: 'ev1', date: '2025-01-13', amountCash: 696.90, amountPix: 154.50, total: 851.40 },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', eventId: 'ev1', date: '2025-01-03', supplier: 'PLASFER', description: 'Copos e Guardanapos', amount: 527.00, category: 'Materiais' },
  { id: 'e2', eventId: 'ev1', date: '2025-01-03', supplier: 'PLASFER', description: 'Sacolas (Extra)', amount: 140.00, category: 'Materiais' },
  { id: 'e3', eventId: 'ev1', date: '2025-01-05', supplier: 'MERCADO EXTRA', description: 'Produtos Limpeza Geral', amount: 107.88, category: 'Limpeza' },
];

export const INITIAL_PURCHASES: Purchase[] = [
  { id: 'p1', eventId: 'ev1', date: '2025-01-07', productId: '1', supplierName: 'LUIS DOCE', quantityPackages: 55, totalCost: 4587.00, unitCostSnapshot: 0.35 }, // Gelinho
  { id: 'p2', eventId: 'ev1', date: '2025-01-07', productId: '8', supplierName: 'GARATINI', quantityPackages: 1080, totalCost: 3769.20, unitCostSnapshot: 3.49 }, // Coca
];
