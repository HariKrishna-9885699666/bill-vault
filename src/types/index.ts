export type CategoryType =
  | "medical"
  | "groceries"
  | "entertainment"
  | "utilities"
  | "rent"
  | "transportation"
  | "dining"
  | "shopping"
  | "education"
  | "insurance"
  | "travel"
  | "electronics"
  | "home_furniture"
  | "personal_care"
  | "taxes"
  | "miscellaneous";

export type PaymentMethod =
  | "cash"
  | "upi"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "wallet"
  | "cheque";

export interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  driveFileId?: string;
  driveUrl?: string;
  thumbnailUrl?: string;
  /** @deprecated — kept only for data already persisted before IndexedDB migration. */
  localDataUrl?: string;
  /** True when the raw blob has been saved to IndexedDB under this attachment's id. */
  hasLocalBlob?: boolean;
}

export interface Bill {
  id: string;
  title: string;
  category: CategoryType;
  /** Only meaningful when category === "medical" */
  patient?: string;
  amount: number;
  currency: string;
  date: string;
  vendor?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}