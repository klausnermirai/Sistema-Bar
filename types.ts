export enum PaymentMethod {
  CASH = 'Dinheiro',
  PIX = 'PIX'
}

export interface Product {
  id: string;
  name: string;
  packagePrice: number; // Price of a full pack (e.g., R$ 83,40)
  unitsPerPackage: number; // Qty inside pack (e.g., 240)
  supplier: string;
  unitCost: number; // Calculated (packagePrice / unitsPerPackage)
  category: string;
}

export interface Purchase {
  id: string;
  date: string;
  productId: string;
  quantityPackages: number; // How many packs bought
  totalCost: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  amountCash: number;
  amountPix: number;
  total: number;
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface InventoryCheck {
  productId: string;
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