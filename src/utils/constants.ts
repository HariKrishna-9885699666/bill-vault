import type { IconType } from "react-icons";
import {
  FaHospital,
  FaShoppingCart,
  FaFilm,
  FaLightbulb,
  FaHome,
  FaCar,
  FaUtensils,
  FaTshirt,
  FaBook,
  FaShieldAlt,
  FaPlane,
  FaMobileAlt,
  FaCouch,
  FaCut,
  FaFileInvoice,
  FaBox,
} from "react-icons/fa";
import type { CategoryType, PaymentMethod } from "@/types";

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  icon: IconType;
  /** Tailwind color token chunk for accent (uses oklch vars in styles.css). */
  token: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "medical", label: "Medical & Healthcare", icon: FaHospital, token: "cat-medical" },
  { id: "groceries", label: "Groceries", icon: FaShoppingCart, token: "cat-groceries" },
  { id: "entertainment", label: "Entertainment", icon: FaFilm, token: "cat-entertainment" },
  { id: "utilities", label: "Utilities", icon: FaLightbulb, token: "cat-utilities" },
  { id: "rent", label: "Rent & Housing", icon: FaHome, token: "cat-rent" },
  { id: "transportation", label: "Transportation", icon: FaCar, token: "cat-transportation" },
  { id: "dining", label: "Dining & Food", icon: FaUtensils, token: "cat-dining" },
  { id: "shopping", label: "Shopping & Clothing", icon: FaTshirt, token: "cat-shopping" },
  { id: "education", label: "Education", icon: FaBook, token: "cat-education" },
  { id: "insurance", label: "Insurance", icon: FaShieldAlt, token: "cat-insurance" },
  { id: "travel", label: "Travel & Vacation", icon: FaPlane, token: "cat-travel" },
  { id: "electronics", label: "Electronics & Gadgets", icon: FaMobileAlt, token: "cat-electronics" },
  { id: "home_furniture", label: "Home & Furniture", icon: FaCouch, token: "cat-home-furniture" },
  { id: "personal_care", label: "Personal Care", icon: FaCut, token: "cat-personal-care" },
  { id: "taxes", label: "Taxes & Government", icon: FaFileInvoice, token: "cat-taxes" },
  { id: "miscellaneous", label: "Miscellaneous", icon: FaBox, token: "cat-misc" },
];

export const CATEGORY_MAP: Record<CategoryType, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryType, CategoryMeta>,
);

export const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "upi", label: "UPI" },
  { id: "credit_card", label: "Credit Card" },
  { id: "debit_card", label: "Debit Card" },
  { id: "net_banking", label: "Net Banking" },
  { id: "wallet", label: "Wallet" },
  { id: "cheque", label: "Cheque" },
];

export const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

export const FAMILY_MEMBERS = ["Hari", "Monika", "Divith", "Father", "Mother"] as const;
export type FamilyMember = (typeof FAMILY_MEMBERS)[number];

export const MAX_FILES_PER_BILL = 5;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const DRIVE_ROOT_FOLDER = "BillVault";