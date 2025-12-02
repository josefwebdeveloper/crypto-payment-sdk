import React from 'react';
import { CheckCircle2, ArrowUpRight, X } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface SuccessCardProps {
  txHash: string;
  amount: number;
  currency: string;
  onClose?: () => void;
}

export const SuccessCard: React.FC<SuccessCardProps> = ({ txHash, amount, currency, onClose }) => {
  // Get explorer URL based on network
  const getExplorerUrl = () => {
    // For now, default to Etherscan Sepolia
    if (txHash.startsWith('0x')) {
      return `https://sepolia.etherscan.io/tx/${txHash}`;
    }
    return `https://tronscan.org/#/transaction/${txHash}`;
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-emerald-900/50 rounded-2xl shadow-2xl overflow-hidden relative animate-fade-in">
      {/* Success gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      
      <div className="p-8 flex flex-col items-center text-center space-y-6">
        {/* Success icon with animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-pulse-ring" />
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center ring-1 ring-emerald-500/30 relative">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Payment Received</h2>
          <p className="text-gray-400">
            We have successfully confirmed your transaction of{' '}
            <span className="text-emerald-400 font-medium">
              {amount.toFixed(currency === 'ETH' ? 6 : 2)} {currency}
            </span>
          </p>
        </div>

        {/* Transaction hash */}
        <div className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-left space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Transaction Hash
          </label>
          <div className="flex items-center justify-between gap-3">
            <code className="text-xs text-gray-300 font-mono break-all line-clamp-2">
              {txHash}
            </code>
            <CopyButton text={txHash} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-3 pt-2">
          <a 
            href={getExplorerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 text-sm text-emerald-400 hover:text-emerald-300 transition-colors border border-emerald-800 hover:border-emerald-600 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10"
          >
            View on Explorer
            <ArrowUpRight className="w-4 h-4" />
          </a>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm text-gray-400 hover:text-white transition-colors border border-gray-800 hover:border-gray-600 rounded-xl"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

