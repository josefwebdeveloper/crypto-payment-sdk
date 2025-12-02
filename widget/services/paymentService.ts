import { PaymentDetails, PaymentStatusResponse, PaymentConfig } from '../types';

let apiConfig: { apiKey: string; apiUrl: string } | null = null;

export function setApiConfig(apiKey: string, apiUrl: string): void {
  apiConfig = { apiKey, apiUrl };
}

function getHeaders(): HeadersInit {
  if (!apiConfig) {
    throw new Error('API not configured');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiConfig.apiKey}`,
    'X-API-Key': apiConfig.apiKey,
  };
}

export const createPayment = async (config: PaymentConfig): Promise<PaymentDetails> => {
  if (!apiConfig) {
    throw new Error('API not configured');
  }

  const res = await fetch(`${apiConfig.apiUrl}/api/payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      amount: config.amount,
      currency: config.currency,
      network: config.network,
      orderId: config.orderId,
      description: config.description,
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to create payment' }));
    throw new Error(error.message);
  }
  
  const data = await res.json();
  
  return {
    paymentId: data.paymentId || data.id || 'pay_' + Date.now(),
    address: data.address,
    amount: parseFloat(data.requiredAmount || data.amount),
    currency: config.currency,
    network: config.network,
    expiresAt: data.expiresAt,
    status: data.status || 'pending',
  };
};

export const getPaymentDetails = async (paymentId: string): Promise<PaymentDetails> => {
  if (!apiConfig) {
    throw new Error('API not configured');
  }

  const res = await fetch(`${apiConfig.apiUrl}/api/payment/${paymentId}`, {
    headers: getHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch payment details');
  }
  
  return res.json();
};

export const checkPaymentStatus = async (_paymentId?: string): Promise<PaymentStatusResponse> => {
  if (!apiConfig) {
    throw new Error('API not configured');
  }

  // Test backend uses a single payment, so always use /api/payment/status
  const url = `${apiConfig.apiUrl}/api/payment/status`;
    
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Failed to check payment status');
  }
  
  const data = await res.json();
  
  return {
    status: data.status,
    txHash: data.txHash,
    confirmedAt: data.updatedAt || data.confirmedAt,
  };
};

// Legacy support for the test backend
export const forcePaymentSuccess = async (): Promise<PaymentStatusResponse> => {
  if (!apiConfig) {
    throw new Error('API not configured');
  }

  await fetch(`${apiConfig.apiUrl}/api/payment/reset`, { 
    method: 'POST',
    headers: getHeaders(),
  });
  return checkPaymentStatus();
};

