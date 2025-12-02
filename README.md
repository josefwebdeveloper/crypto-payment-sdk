# CryptoPayments SDK

Embeddable JavaScript SDK for accepting cryptocurrency payments on any website.

## Features

- 🎨 **Beautiful Payment Modal** - Modern, responsive payment UI
- ⚡ **Easy Integration** - Single script tag, minimal code
- 🔄 **Real-time Updates** - Automatic polling for payment status
- 📱 **Mobile Friendly** - Works great on all devices
- 🔒 **Secure** - Communication via postMessage, no sensitive data exposed

## Quick Start

### 1. Include the SDK

```html
<script src="https://pay.your-domain.com/sdk.js"></script>
```

### 2. Initialize

```javascript
CryptoPayments.init({
  apiKey: 'pk_live_xxx',
  debug: true // optional
});
```

### 3. Open Payment Modal

```javascript
CryptoPayments.openPayment({
  amount: 100,
  currency: 'USDT',
  network: 'TRC20',
  orderId: 'order_123',
  
  onSuccess: (result) => {
    console.log('Payment confirmed!', result.txHash);
    // Redirect to success page
  },
  
  onClose: () => {
    console.log('User closed the modal');
  },
  
  onError: (error) => {
    console.error('Payment error:', error.message);
  }
});
```

## Configuration Options

### `CryptoPayments.init(config)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | string | Yes | Your API key (pk_live_xxx or pk_test_xxx) |
| `apiUrl` | string | No | Custom API URL (default: production) |
| `widgetUrl` | string | No | Custom widget URL (default: CDN) |
| `debug` | boolean | No | Enable console logging |

### `CryptoPayments.openPayment(options)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `amount` | number | Yes | Payment amount |
| `currency` | string | No | Currency code (default: 'USDT') |
| `network` | string | No | Blockchain network (default: 'TRC20') |
| `orderId` | string | No | Your order reference |
| `description` | string | No | Payment description |
| `onSuccess` | function | No | Called when payment is confirmed |
| `onClose` | function | No | Called when modal is closed |
| `onError` | function | No | Called on error |
| `onExpire` | function | No | Called when payment expires |

## Payment Result

The `onSuccess` callback receives a result object:

```typescript
{
  paymentId: string;    // Payment ID
  txHash: string;       // Blockchain transaction hash
  amount: number;       // Amount paid
  currency: string;     // Currency code
  network: string;      // Network used
  confirmedAt: string;  // ISO timestamp
  orderId?: string;     // Your order ID
}
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start demo page (port 5173)
npm run dev

# Start widget dev server (port 5174)
npm run dev:widget

# Start test backend (in another terminal)
cd ../payment-sdk-test-back
npm start
```

### Build

```bash
# Build everything
npm run build

# Build SDK only
npm run build:sdk

# Build widget only
npm run build:widget
```

### Output

After build:
- `dist/sdk.es.js` - ES module
- `dist/sdk.umd.js` - UMD bundle (for script tag)
- `dist/widget/` - Hosted widget files

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Merchant Website                                   │
│  ┌───────────────────────────────────────────────┐  │
│  │  <script src="sdk.js">                        │  │
│  │  CryptoPayments.openPayment({amount: 100})    │  │
│  └───────────────────────────────────────────────┘  │
│                        │                            │
│                        ▼                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  Payment Modal (iframe)                       │  │
│  │  - QR Code                                    │  │
│  │  - Wallet Address                             │  │
│  │  - Timer                                      │  │
│  │  - Status Updates                             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼ postMessage + API
              ┌───────────────────────┐
              │  Backend API          │
              │  - Create payment     │
              │  - Check status       │
              │  - Webhooks           │
              └───────────────────────┘
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT

