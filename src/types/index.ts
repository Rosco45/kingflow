export type CurrencyCode = "XOF" | "EUR" | "USD";

export interface CompanySettingsData {
  id: string;
  name: string;
  tagline?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  taxId?: string | null;
  currency: CurrencyCode;
  defaultVatRate: number;
  logoUrl?: string | null;
  invoiceTerms?: string | null;
  receiptFooter?: string | null;
}

export interface CustomerData {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  invoices?: InvoiceData[];
  payments?: PaymentData[];
  _count?: {
    invoices: number;
    payments: number;
  };
  totalBilled?: number;
  totalPaid?: number;
  balanceDue?: number;
}

export interface SupplierData {
  id: string;
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  category?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  expenses?: ExpenseData[];
  totalPurchased?: number;
  totalDue?: number;
}

export interface ProductData {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  category: string;
  type: "PRODUCT" | "SERVICE";
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  unit: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  stockMovements?: StockMovementData[];
}

export interface StockMovementData {
  id: string;
  productId: string;
  product?: ProductData;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: "RECEPTION_FOURNISSEUR" | "VENTE_FACTURE" | "PERTE" | "CASSE" | "INVENTAIRE" | "RETOUR" | string;
  referenceDoc?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export type DocumentType = "INVOICE" | "QUOTE";
export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type DiscountType = "PERCENT" | "FIXED";

export interface InvoiceItemData {
  id?: string;
  invoiceId?: string;
  productId?: string | null;
  product?: ProductData | null;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentData {
  id: string;
  invoiceId?: string | null;
  invoice?: {
    id: string;
    number: string;
  } | null;
  customerId?: string | null;
  customer?: {
    id: string;
    name: string;
  } | null;
  amount: number;
  paymentDate: string | Date;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "WAVE" | "ORANGE_MONEY" | "MTN_MOMO" | "CHECK" | "CARD" | string;
  reference?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface InvoiceData {
  id: string;
  number: string;
  type: DocumentType;
  customerId: string;
  customer?: CustomerData;
  status: InvoiceStatus;
  issueDate: string | Date;
  dueDate: string | Date;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  notes?: string | null;
  terms?: string | null;
  items: InvoiceItemData[];
  payments?: PaymentData[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ExpenseData {
  id: string;
  title: string;
  category: "LOYER" | "ELECTRICITE_EAU" | "TRANSPORT" | "SALAIRES" | "ACHAT_FOURNISSEUR" | "MARKETING" | "AUTRES" | string;
  amount: number;
  expenseDate: string | Date;
  paymentMethod: string;
  isPaid: boolean;
  supplierId?: string | null;
  supplier?: SupplierData | null;
  receiptUrl?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface DashboardStats {
  monthlyRevenue: number;
  pendingReceivables: number;
  monthlyExpenses: number;
  estimatedNetMargin: number;
  revenueTrend: number;
  expensesTrend: number;
  unpaidInvoicesCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  sixMonthsTrend: {
    month: string;
    sales: number;
    expenses: number;
    margin: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    sku: string;
    category: string;
    soldQty: number;
    revenue: number;
    stockQuantity: number;
    minStockAlert: number;
  }[];
  lowStockItems: ProductData[];
  recentInvoices: InvoiceData[];
}
