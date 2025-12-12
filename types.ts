
export enum PaymentMethod {
  CASH = 'Dinheiro',
  PIX = 'PIX'
}

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // Stored in plain text for this simple demo context
  role: 'admin' | 'user';
}

export interface Event {
  id: string;
  name: string;
  date?: string;
  status: 'active' | 'archived';
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  measureUnit: 'Cx' | 'Pct' | 'Fardo' | 'Kg' | 'Un'; // Unit of measure
  packagePrice: number; // Price of a full pack (e.g., R$ 83,40)
  unitsPerPackage: number; // Qty inside pack (e.g., 240)
  supplier: string; // This acts as the Default/Preferred Supplier
  unitCost: number; // Calculated (packagePrice / unitsPerPackage)
  category: string;
}

export interface Purchase {
  id: string;
  eventId: string; // Linked to specific event
  date: string;
  productId: string;
  supplierName: string; // The actual supplier for this specific purchase
  quantityPackages: number; // How many packs bought
  totalCost: number;
  unitCostSnapshot?: number; // Calculated unit cost at the moment of purchase (Historical record)
}

export interface SaleRecord {
  id: string;
  eventId: string; // Linked to specific event
  date: string;
  amountCash: number;
  amountPix: number;
  total: number;
  notes?: string;
}

export interface Expense {
  id: string;
  eventId: string; // Linked to specific event
  date: string;
  supplier?: string; // Optional: Link to a registered supplier
  description: string;
  amount: number;
  category: string;
}

export interface InventoryCheck {
  productId: string;
  eventId: string; // Linked to specific event
  currentStock: number; // Counted units
  lastUpdated: string;
}

// Derived type for Inventory View
export interface ProductStatus {
  product: Product;
  totalPurchasedUnits: number;
  totalPurchasedCost: number;
  estimatedSalesUnits: number; // (Purchased - Current Stock)
  currentStock: number;
  averageDailySales: number;
  daysRemaining: number;
  status: 'Critical' | 'Low' | 'Good' | 'Overstock';
}
