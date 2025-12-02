import React, { useEffect, useState, useRef, useCallback } from 'react';
import { PaymentDetails, PaymentStatus, PaymentConfig, WidgetMessage } from './types';
import { createPayment, checkPaymentStatus, setApiConfig } from './services/paymentService';
import { PaymentCard } from './components/PaymentCard';
import { SuccessCard } from './components/SuccessCard';
import { Loader2, AlertTriangle } from 'lucide-react';

const POLLING_INTERVAL = 5000;

// Parse URL parameters
function getConfigFromUrl(): PaymentConfig | null {
  const params = new URLSearchParams(window.location.search);
  
  console.log('[Widget] URL search:', window.location.search);
  console.log('[Widget] Parsed params:', Object.fromEntries(params.entries()));
  
  const amount = params.get('amount');
  const apiKey = params.get('apiKey');
  const apiUrl = params.get('apiUrl');
  
  console.log('[Widget] apiUrl from params:', apiUrl);
  
  if (!amount || !apiKey || !apiUrl) {
    console.warn('[Widget] Missing params - amount:', amount, 'apiKey:', apiKey, 'apiUrl:', apiUrl);
    return null;
  }
  
  return {
    amount: parseFloat(amount),
    currency: params.get('currency') || 'USDT',
    network: params.get('network') || 'TRC20',
    orderId: params.get('orderId') || undefined,
    description: params.get('description') || undefined,
    apiKey,
    apiUrl,
  };
}

// Send message to parent window
function sendToParent(message: WidgetMessage): void {
  if (window.parent !== window) {
    window.parent.postMessage(message, '*');
  }
}

function App() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualChecking, setManualChecking] = useState(false);
  
  const pollIntervalRef = useRef<number | null>(null);
  const paymentIdRef = useRef<string | null>(null);

  // Initialize from URL params
  useEffect(() => {
    const urlConfig = getConfigFromUrl();
    
    if (urlConfig) {
      console.log('[Widget] Config from URL:', urlConfig);
      setConfig(urlConfig);
      setApiConfig(urlConfig.apiKey, urlConfig.apiUrl);
    } else {
      console.warn('[Widget] No config found in URL params');
    }
  }, []);

  // Create payment when config is ready
  useEffect(() => {
    if (!config) return;
    
    const initPayment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const payment = await createPayment(config);
        setDetails(payment);
        paymentIdRef.current = payment.paymentId;
        
        // Notify parent that widget is ready
        sendToParent({ type: 'CRYPTO_PAY_READY' });
        
        setLoading(false);
        startPolling();
      } catch (e) {
        console.error('Failed to create payment:', e);
        setError(e instanceof Error ? e.message : 'Failed to create payment');
        setLoading(false);
        
        sendToParent({
          type: 'CRYPTO_PAY_ERROR',
          payload: { code: 'INIT_FAILED', message: 'Failed to create payment' }
        });
      }
    };
    
    initPayment();
    
    return () => stopPolling();
  }, [config]);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) return;
    
    pollIntervalRef.current = window.setInterval(async () => {
      if (status === 'paid' || status === 'expired') return;
      
      try {
        const res = await checkPaymentStatus(paymentIdRef.current || undefined);
        
        if (res.status === 'paid') {
          handleSuccess(res.txHash);
        } else if (res.status === 'expired') {
          handleExpire();
        }
      } catch (err) {
        console.warn('Polling failed:', err);
      }
    }, POLLING_INTERVAL);
  }, [status]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((hash?: string) => {
    const finalHash = hash || '0x' + Math.random().toString(16).slice(2);
    
    setStatus('paid');
    setTxHash(finalHash);
    stopPolling();
    
    sendToParent({
      type: 'CRYPTO_PAY_SUCCESS',
      payload: {
        paymentId: paymentIdRef.current,
        txHash: finalHash,
        amount: details?.amount || config?.amount,
        currency: details?.currency || config?.currency,
        network: details?.network || config?.network,
        confirmedAt: new Date().toISOString(),
        orderId: config?.orderId,
      }
    });
  }, [details, config, stopPolling]);

  const handleExpire = useCallback(() => {
    setStatus('expired');
    stopPolling();
    
    sendToParent({ type: 'CRYPTO_PAY_EXPIRE' });
  }, [stopPolling]);

  const handleClose = useCallback(() => {
    sendToParent({ type: 'CRYPTO_PAY_CLOSE' });
  }, []);

  const handleManualCheck = async () => {
    if (manualChecking) return;
    
    setManualChecking(true);
    
    try {
      const res = await checkPaymentStatus(paymentIdRef.current || undefined);
      
      if (res.status === 'paid') {
        handleSuccess(res.txHash);
      }
    } catch (e) {
      console.error('Manual check failed:', e);
    } finally {
      setManualChecking(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 border border-red-900/50 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Payment Error</h2>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-emerald-500">
          <Loader2 className="w-10 h-10 animate-spin" />
          <span className="text-sm font-medium tracking-wide animate-pulse">
            INITIALIZING PAYMENT...
          </span>
        </div>
      </div>
    );
  }

  // Main payment view
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      {status === 'paid' && details ? (
        <SuccessCard 
          txHash={txHash || ''} 
          amount={details.amount} 
          currency={details.currency}
          onClose={handleClose}
        />
      ) : details ? (
        <PaymentCard 
          details={details} 
          onManualCheck={handleManualCheck} 
          isChecking={manualChecking}
        />
      ) : (
        <div className="text-red-500 text-center">
          <p>Unable to load payment details.</p>
          <button
            onClick={handleClose}
            className="mt-4 px-6 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

