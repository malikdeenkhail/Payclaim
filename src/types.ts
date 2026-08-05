export type ClaimStatus = "Unclaimed" | "Pending Verification" | "Approved" | "Payment Processing" | "Paid" | "Rejected";
export type PaymentMethod = "JazzCash" | "Easypaisa" | "Bank Transfer";

export interface PaymentClaim {
  id: string;
  amount: number;
  reason: string;
  status: ClaimStatus;
  createdAt: string;
  fullName?: string;
  mobileNumber?: string;
  paymentMethod?: PaymentMethod;
  location?: { lat: number; lng: number };
  transactionReference?: string;
  updatedAt?: string;
}
