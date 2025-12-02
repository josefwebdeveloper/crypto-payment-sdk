/**
 * SDK Configuration options
 */
export interface CryptoPaymentsConfig {
  /** API key for authentication (format: pk_live_xxx or pk_test_xxx) */
  apiKey: string;
  /** Base URL for the payment API (optional, defaults to production) */
  apiUrl?: string;
  /** URL where the widget is hosted (optional, defaults to CDN) */
  widgetUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Payment request options
 */
export interface PaymentOptions {
  /** Amount to charge */
  amount: number;
  /** Currency code (e.g., 'USDT', 'ETH') */
  currency?: string;
  /** Blockchain network (e.g., 'TRC20', 'ERC20', 'Sepolia') */
  network?: string;
  /** Your internal order/reference ID */
  orderId?: string;
  /** Customer email (optional) */
  customerEmail?: string;
  /** Payment description */
  description?: string;
  /** Metadata to attach to the payment */
  metadata?: Record<string, string>;
  /** Callback when payment succeeds */
  onSuccess?: (result: PaymentResult) => void;
  /** Callback when user closes the modal */
  onClose?: () => void;
  /** Callback on payment error */
  onError?: (error: PaymentError) => void;
  /** Callback when payment expires */
  onExpire?: () => void;
}

/**
 * Payment result returned on success
 */
export interface PaymentResult {
  /** Payment ID */
  paymentId: string;
  /** Transaction hash on blockchain */
  txHash: string;
  /** Amount paid */
  amount: number;
  /** Currency */
  currency: string;
  /** Network used */
  network: string;
  /** Timestamp of confirmation */
  confirmedAt: string;
  /** Your order ID */
  orderId?: string;
}

/**
 * Payment error
 */
export interface PaymentError {
  code: string;
  message: string;
}

/**
 * Payment status
 */
export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed';

/**
 * Internal: Payment details from API
 */
export interface PaymentDetails {
  paymentId: string;
  address: string;
  amount: number;
  currency: string;
  network: string;
  expiresAt: string;
  status: PaymentStatus;
}

/**
 * Internal: Message types for postMessage communication
 */
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

