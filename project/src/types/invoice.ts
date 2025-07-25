export interface LineItem {
  description: string;
  amount: number;
  category: 'goods' | 'services' | 'exempt';
  taxRate: number;
}

export interface TaxSummary {
  totalTaxableAmount: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  grandTotal: number;
}

export interface InvoiceData {
  filename: string;
  invoiceNumber: string;
  invoiceDate: string;
  vendorName: string;
  gstin: string;
  totalAmount: number;
  lineItems: LineItem[];
  taxSummary: TaxSummary;
}