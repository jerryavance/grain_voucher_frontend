import {
  STATUS_PENDING,
  TRANSACTION_STATUS_CANCELLED,
  TRANSACTION_STATUS_COMPLETED,
  TRANSACTION_STATUS_FAILED,
  TRANSACTION_STATUS_PENDING,
} from "../api/constants";
import { IUser } from "../pages/Users/Users.interface";

export const beautifyName = (user: IUser | undefined) => {
  return (
    `${user?.first_name} ${user?.last_name}` +
    (user?.other_name ? ` ${user?.other_name}` : "")
  );
};

export const capitalizeFirstLetter = (string: string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};


export const getOrdinalSuffix = (n: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = n % 100; // Consider last two digits for special cases like 11, 12, 13
  if (value > 10 && value < 20) {
    return n + suffixes[0]; // 'th' for 11th, 12th, 13th, etc.
  }
  const lastDigit = n % 10;
  return n + (suffixes[lastDigit] || suffixes[0]); // Append 'st', 'nd', 'rd', or 'th'
};

export const getStatusClass = (type: string) => {
  switch (type) {
    case "completed":
    case "in_progress":
    case "active":
      return "span-green";
    case "initial":
    case "draws_not_released":
    case "unavailable":
      return "span-orange";
    case "started":
      return "span-blue";
  }
};


export const getActionMessage = (action: string) => {
  switch (action) {
    case TRANSACTION_STATUS_COMPLETED:
      return "completed";
    case TRANSACTION_STATUS_PENDING:
      return "pending";
    case TRANSACTION_STATUS_FAILED:
      return "failed";
    case TRANSACTION_STATUS_CANCELLED:
      return "cancelled";
    default:
      return "";
  }
};




export function stringify(text: any) {
  return text?.replaceAll?.("_", " ")?.replaceAll("-", " ");
}

export function getStatusColor(status: any) {
  if (!status) return "default";

  switch (status?.toLowerCase()) {
    case TRANSACTION_STATUS_COMPLETED:
      return "green-inverse";     // ✅ Completed
    case TRANSACTION_STATUS_PENDING:
    case STATUS_PENDING:
    case "registration":
      return "gold-inverse";      // ⏳ Pending
    case TRANSACTION_STATUS_FAILED:
      return "red-inverse";       // ❌ Failed
    case TRANSACTION_STATUS_CANCELLED:
      return "volcano-inverse";   // 🛑 Cancelled
    default:
      return "default";           // Fallback
  }
}


export const prepareObjectFormdataPost = (object: Record<string, string>, field: string) => {
  let extras = {};
  Object.keys(object).forEach((key) => {
    extras = { ...extras, [`${field}.${key}`]: object[key] }
  });
  return extras;
};


export const createFormData = (object: Record<string, string>) => {
  const formData = new FormData();
  Object.keys(object).forEach((key) => {
    formData.append(key, object[key]);
  });
  return formData;
};


export const getLoanStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return { text: "#155724", bg: "#d4edda" }; // Green
    case "pending":
      return { text: "#856404", bg: "#fff3cd" }; // Yellow
    case "funded":
      return { text: "#004085", bg: "#cce5ff" }; // Blue
    case "defaulted":
      return { text: "#721c24", bg: "#f8d7da" }; // Red
    case "repaid":
      return { text: "#1b4332", bg: "#d8f3dc" }; // Dark green
    case "cancelled":
      return { text: "#383d41", bg: "#e2e3e5" }; // Gray
    default:
      return { text: "#000", bg: "#f0f0f0" };   // Fallback
  }
};

export const getDepositStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "validated":
    case "approved":
      return { text: "#155724", bg: "#d4edda" }; // Green - deposit is validated/approved
    case "pending":
    case "unvalidated":
      return { text: "#856404", bg: "#fff3cd" }; // Yellow - waiting for validation
    case "received":
    case "deposited":
      return { text: "#004085", bg: "#cce5ff" }; // Blue - grain received at hub
    case "rejected":
    case "failed":
      return { text: "#721c24", bg: "#f8d7da" }; // Red - deposit rejected/failed validation
    case "processed":
    case "sold":
      return { text: "#1b4332", bg: "#d8f3dc" }; // Dark green - grain has been processed/sold
    case "stored":
    case "in_storage":
      return { text: "#0f5132", bg: "#badbcc" }; // Medium green - grain in storage
    case "quality_check":
    case "testing":
      return { text: "#664d03", bg: "#fef3c7" }; // Amber - quality testing in progress
    case "expired":
    case "spoiled":
      return { text: "#842029", bg: "#f1aeb5" }; // Dark red - grain expired/spoiled
    case "cancelled":
    case "withdrawn":
      return { text: "#383d41", bg: "#e2e3e5" }; // Gray - deposit cancelled/withdrawn
    default:
      return { text: "#000", bg: "#f0f0f0" };   // Fallback - unknown status
  }
};