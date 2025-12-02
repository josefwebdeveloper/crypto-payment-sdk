export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed';

export interface PaymentDetails {
  paymentId: string;
  address: string;
  amount: number;
  currency: string;
  network: string;
  expiresAt: string;
  status: PaymentStatus;
}

export interface PaymentStatusResponse {
  status: PaymentStatus;
  txHash?: string;
  confirmedAt?: string;
}

export interface PaymentConfig {
  amount: number;
  currency: string;
  network: string;
  orderId?: string;
  description?: string;
  apiKey: string;
  apiUrl: string;
}

export type WidgetMessageType = 
  | 'CRYPTO_PAY_INIT'
  | 'CRYPTO_PAY_READY'
  | 'CRYPTO_PAY_SUCCESS'
  | 'CRYPTO_PAY_CLOSE'
  | 'CRYPTO_PAY_ERROR'
  | 'CRYPTO_PAY_EXPIRE';

export interface WidgetMessage {
  type: WidgetMessageType;
  payload?: unknown;
}

