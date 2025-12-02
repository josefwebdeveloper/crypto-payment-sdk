import type { PaymentDetails, PaymentOptions, PaymentStatus } from './types';

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
}

let config: ApiConfig | null = null;

export function setApiConfig(apiKey: string, baseUrl: string): void {
  config = { apiKey, baseUrl };
}

function getHeaders(): HeadersInit {
  if (!config) {
    throw new Error('API not configured. Call CryptoPayments.init() first.');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.apiKey}`,
    'X-API-Key': config.apiKey,
  };
}

/**
 * Create a new payment session
 */
export async function createPayment(options: PaymentOptions): Promise<PaymentDetails> {
  if (!config) {
    throw new Error('API not configured');
  }

  const response = await fetch(`${config.baseUrl}/api/payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency || 'USDT',
      network: options.network || 'TRC20',
      orderId: options.orderId,
      customerEmail: options.customerEmail,
      description: options.description,
      metadata: options.metadata,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Get payment details by ID
 */
export async function getPayment(paymentId: string): Promise<PaymentDetails> {
  if (!config) {
    throw new Error('API not configured');
  }

  const response = await fetch(`${config.baseUrl}/api/payment/${paymentId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get payment: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(paymentId: string): Promise<{
  status: PaymentStatus;
  txHash?: string;
  confirmedAt?: string;
}> {
  if (!config) {
    throw new Error('API not configured');
  }

  const response = await fetch(`${config.baseUrl}/api/payment/${paymentId}/status`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to check status: HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Helper to build widget URL with payment session
 */
export function buildWidgetUrl(
  widgetBaseUrl: string,
  paymentId: string,
  apiKey: string
): string {
  const params = new URLSearchParams({
    paymentId,
    apiKey,
  });
  
  return `${widgetBaseUrl}?${params.toString()}`;
}

