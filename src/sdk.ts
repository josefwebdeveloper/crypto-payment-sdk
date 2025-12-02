/**
 * CryptoPayments SDK
 * 
 * Embeddable payment widget for accepting cryptocurrency payments.
 * 
 * @example
 * ```js
 * // Initialize the SDK
 * CryptoPayments.init({ apiKey: 'pk_live_xxx' });
 * 
 * // Open payment modal
 * CryptoPayments.openPayment({
 *   amount: 100,
 *   currency: 'USDT',
 *   orderId: 'order_123',
 *   onSuccess: (result) => console.log('Paid!', result.txHash),
 *   onClose: () => console.log('Closed')
 * });
 * ```
 */

import type {
  CryptoPaymentsConfig,
  PaymentOptions,
  PaymentResult,
  PaymentError,
} from './types';
import { openModal, closeModal, isModalOpen } from './modal';
import { setApiConfig } from './api';

// Default configuration
const DEFAULT_API_URL = 'http://localhost:3000';
const DEFAULT_WIDGET_URL = 'http://localhost:5174';

// SDK State
let initialized = false;
let config: CryptoPaymentsConfig | null = null;

function log(...args: unknown[]): void {
  if (config?.debug) {
    console.log('[CryptoPayments]', ...args);
  }
}

function warn(...args: unknown[]): void {
  console.warn('[CryptoPayments]', ...args);
}

function error(...args: unknown[]): void {
  console.error('[CryptoPayments]', ...args);
}

/**
 * Initialize the CryptoPayments SDK
 * 
 * @param options - Configuration options
 * @throws Error if apiKey is not provided
 * 
 * @example
 * ```js
 * CryptoPayments.init({
 *   apiKey: 'pk_live_xxx',
 *   debug: true
 * });
 * ```
 */
function init(options: CryptoPaymentsConfig): void {
  if (!options.apiKey) {
    throw new Error('CryptoPayments: apiKey is required');
  }

  config = {
    apiKey: options.apiKey,
    apiUrl: options.apiUrl || DEFAULT_API_URL,
    widgetUrl: options.widgetUrl || DEFAULT_WIDGET_URL,
    debug: options.debug || false,
  };

  // Configure API client
  setApiConfig(config.apiKey, config.apiUrl!);

  initialized = true;
  log('Initialized with config:', { ...config, apiKey: '***' });
}

/**
 * Open the payment modal
 * 
 * @param options - Payment options including amount, callbacks, etc.
 * @throws Error if SDK is not initialized
 * 
 * @example
 * ```js
 * CryptoPayments.openPayment({
 *   amount: 50,
 *   currency: 'USDT',
 *   network: 'TRC20',
 *   orderId: 'order_abc',
 *   onSuccess: (result) => {
 *     console.log('Payment confirmed!', result.txHash);
 *     // Redirect to success page or update UI
 *   },
 *   onClose: () => {
 *     console.log('User closed the payment modal');
 *   },
 *   onError: (err) => {
 *     console.error('Payment error:', err.message);
 *   }
 * });
 * ```
 */
function openPayment(options: PaymentOptions): void {
  if (!initialized || !config) {
    throw new Error('CryptoPayments: SDK not initialized. Call init() first.');
  }

  if (!options.amount || options.amount <= 0) {
    throw new Error('CryptoPayments: amount must be a positive number');
  }

  if (isModalOpen()) {
    warn('Payment modal is already open');
    return;
  }

  log('Opening payment modal with options:', options);

  // Build widget URL with payment parameters
  const params = new URLSearchParams({
    amount: String(options.amount),
    currency: options.currency || 'USDT',
    network: options.network || 'TRC20',
    apiKey: config.apiKey,
    apiUrl: config.apiUrl || DEFAULT_API_URL,
  });

  if (options.orderId) {
    params.set('orderId', options.orderId);
  }

  if (options.description) {
    params.set('description', options.description);
  }

  const widgetUrl = `${config.widgetUrl}?${params.toString()}`;

  openModal(widgetUrl, options, {
    onSuccess: (result: PaymentResult) => {
      log('Payment successful:', result);
      options.onSuccess?.(result);
    },
    onClose: () => {
      log('Payment modal closed');
      options.onClose?.();
    },
    onError: (err: PaymentError) => {
      error('Payment error:', err);
      options.onError?.(err);
    },
    onExpire: () => {
      log('Payment expired');
      options.onExpire?.();
    },
  });
}

/**
 * Close the payment modal programmatically
 * 
 * @example
 * ```js
 * // Close modal after some action
 * CryptoPayments.close();
 * ```
 */
function close(): void {
  if (isModalOpen()) {
    log('Closing payment modal');
    closeModal();
  }
}

/**
 * Check if the SDK is initialized
 */
function isInitialized(): boolean {
  return initialized;
}

/**
 * Get the current SDK version
 */
function getVersion(): string {
  return '1.0.0';
}

// Export as a single object for UMD compatibility
const CryptoPayments = {
  init,
  openPayment,
  close,
  isInitialized,
  getVersion,
};

// Export for ES modules
export {
  init,
  openPayment,
  close,
  isInitialized,
  getVersion,
};

// Export types
export type {
  CryptoPaymentsConfig,
  PaymentOptions,
  PaymentResult,
  PaymentError,
} from './types';

// Default export
export default CryptoPayments;

// UMD global export
if (typeof window !== 'undefined') {
  (window as unknown as { CryptoPayments: typeof CryptoPayments }).CryptoPayments = CryptoPayments;
}

