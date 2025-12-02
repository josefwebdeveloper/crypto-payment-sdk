import React, { useState, useEffect } from 'react';
import { PaymentDetails } from '../types';
import { CopyButton } from './CopyButton';
import { RefreshCw, Wallet, ShieldCheck, AlertCircle, Clock } from 'lucide-react';

interface PaymentCardProps {
  details: PaymentDetails;
  onManualCheck: () => void;
  isChecking: boolean;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ details, onManualCheck, isChecking }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const expiresAt = new Date(details.expiresAt).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiresAt - now) / 1000));
      setTimeLeft(diff);
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [details.expiresAt]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const isExpired = timeLeft === 0;
  
  // Generate QR code URL
  const qrData = `ethereum:${details.address}?value=${details.amount}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(details.address)}&color=000000&bgcolor=ffffff&margin=10`;

  // Get currency icon
  const getCurrencyIcon = () => {
    switch (details.currency.toUpperCase()) {
      case 'USDT':
        return 'https://cryptologos.cc/logos/tether-usdt-logo.png';
      case 'ETH':
        return 'https://cryptologos.cc/logos/ethereum-eth-logo.png';
      case 'BTC':
        return 'https://cryptologos.cc/logos/bitcoin-btc-logo.png';
      default:
        return 'https://cryptologos.cc/logos/tether-usdt-logo.png';
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in">
      {/* Header */}
      <div className="bg-gray-800/50 p-5 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Payment Request</h2>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 
            <span>Secure Gateway</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-700">
          <img src={getCurrencyIcon()} alt={details.currency} className="w-5 h-5"/>
          <span className="text-xs font-mono text-emerald-400 font-bold">{details.network}</span>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Timer */}
        <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${isExpired ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isExpired ? 'Payment expired' : `Expires in ${formatTime(timeLeft)}`}
          </span>
        </div>

        {/* Amount */}
        <div className="text-center space-y-1">
          <p className="text-gray-400 text-sm font-medium">Total Amount</p>
          <div className="text-4xl font-bold text-white tracking-tight flex items-baseline justify-center gap-2">
            {details.amount.toFixed(details.currency === 'ETH' ? 6 : 2)}
            <span className="text-lg text-emerald-500 font-medium">{details.currency}</span>
          </div>
        </div>

        {/* QR Code Area */}
        <div className="flex justify-center">
          <div className="p-3 bg-white rounded-xl shadow-lg relative group">
            <img 
              src={qrUrl} 
              alt="Payment QR" 
              className={`w-44 h-44 object-contain transition-opacity ${isExpired ? 'opacity-30' : ''}`}
            />
            {isExpired && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-900 font-semibold text-sm bg-white/90 px-3 py-1 rounded">
                  EXPIRED
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Wallet Address
            </label>
            <span className="text-xs text-amber-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> 
              Only send {details.currency} ({details.network})
            </span>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-2 group hover:border-gray-700 transition-colors">
            <p className="font-mono text-sm text-gray-300 break-all truncate">
              {details.address}
            </p>
            <CopyButton text={details.address} />
          </div>
        </div>

        {/* Amount to send (for copying) */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Amount to Send
          </label>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-2 group hover:border-gray-700 transition-colors">
            <p className="font-mono text-sm text-gray-300">
              {details.amount.toFixed(details.currency === 'ETH' ? 6 : 2)} {details.currency}
            </p>
            <CopyButton text={details.amount.toString()} />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={onManualCheck}
            disabled={isChecking || isExpired}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/30 disabled:cursor-not-allowed text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-[0.98] disabled:active:scale-100"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Checking Status...
              </>
            ) : isExpired ? (
              'Payment Expired'
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                I Have Paid
              </>
            )}
          </button>
          
          {!isExpired && (
            <p className="text-center text-xs text-gray-500 mt-4 animate-pulse">
              Scanning blockchain for transaction...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

