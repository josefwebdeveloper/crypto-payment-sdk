import {
  OVERLAY_STYLES,
  OVERLAY_VISIBLE_STYLES,
  MODAL_CONTAINER_STYLES,
  MODAL_VISIBLE_STYLES,
  IFRAME_STYLES,
  CLOSE_BUTTON_STYLES,
  CLOSE_BUTTON_HOVER_STYLES,
  CLOSE_ICON_SVG,
  LOADING_STYLES,
  SPINNER_STYLES,
  KEYFRAMES,
} from './styles';
import type { PaymentOptions, WidgetMessage, PaymentResult } from './types';

interface ModalInstance {
  overlay: HTMLDivElement;
  iframe: HTMLIFrameElement;
  destroy: () => void;
}

let currentModal: ModalInstance | null = null;
let styleInjected = false;

function injectStyles(): void {
  if (styleInjected) return;
  
  const style = document.createElement('style');
  style.id = 'cryptopay-styles';
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'cryptopay-overlay';
  overlay.style.cssText = OVERLAY_STYLES;
  return overlay;
}

function createModalContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'cryptopay-modal';
  container.style.cssText = MODAL_CONTAINER_STYLES;
  return container;
}

function createCloseButton(onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.id = 'cryptopay-close';
  button.style.cssText = CLOSE_BUTTON_STYLES;
  button.innerHTML = CLOSE_ICON_SVG;
  button.title = 'Close';
  
  button.addEventListener('mouseenter', () => {
    button.style.cssText = CLOSE_BUTTON_STYLES + CLOSE_BUTTON_HOVER_STYLES;
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.cssText = CLOSE_BUTTON_STYLES;
  });
  
  button.addEventListener('click', onClick);
  
  return button;
}

function createLoadingIndicator(): HTMLDivElement {
  const loading = document.createElement('div');
  loading.id = 'cryptopay-loading';
  loading.style.cssText = LOADING_STYLES;
  loading.innerHTML = `
    <div style="${SPINNER_STYLES}"></div>
    <span>Loading payment...</span>
  `;
  return loading;
}

function createIframe(widgetUrl: string): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.id = 'cryptopay-iframe';
  iframe.src = widgetUrl;
  iframe.style.cssText = IFRAME_STYLES;
  iframe.allow = 'clipboard-write';
  iframe.setAttribute('loading', 'eager');
  return iframe;
}

export function openModal(
  widgetUrl: string,
  options: PaymentOptions,
  callbacks: {
    onSuccess?: (result: PaymentResult) => void;
    onClose?: () => void;
    onError?: (error: { code: string; message: string }) => void;
    onExpire?: () => void;
  }
): void {
  // Close existing modal if any
  if (currentModal) {
    currentModal.destroy();
  }

  injectStyles();

  const overlay = createOverlay();
  const container = createModalContainer();
  const loading = createLoadingIndicator();
  const iframe = createIframe(widgetUrl);

  const closeModal = () => {
    // Animate out
    overlay.style.cssText = OVERLAY_STYLES;
    container.style.cssText = MODAL_CONTAINER_STYLES;
    
    setTimeout(() => {
      if (currentModal) {
        currentModal.destroy();
      }
    }, 200);
    
    callbacks.onClose?.();
  };

  const closeButton = createCloseButton(closeModal);

  // Handle click outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Handle escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Handle messages from iframe
  const handleMessage = (event: MessageEvent) => {
    // Validate origin in production
    const message = event.data as WidgetMessage;
    
    if (!message || typeof message.type !== 'string') return;
    if (!message.type.startsWith('CRYPTO_PAY_')) return;

    switch (message.type) {
      case 'CRYPTO_PAY_READY':
        // Widget is ready, hide loading
        loading.style.display = 'none';
        break;
        
      case 'CRYPTO_PAY_SUCCESS':
        callbacks.onSuccess?.(message.payload as PaymentResult);
        // Keep modal open to show success state, user can close manually
        break;
        
      case 'CRYPTO_PAY_CLOSE':
        closeModal();
        break;
        
      case 'CRYPTO_PAY_ERROR':
        callbacks.onError?.(message.payload as { code: string; message: string });
        break;
        
      case 'CRYPTO_PAY_EXPIRE':
        callbacks.onExpire?.();
        break;
    }
  };
  window.addEventListener('message', handleMessage);

  // When iframe loads, send init data (without callbacks - they can't be cloned)
  // Note: API config is already in URL params, so postMessage is mainly for confirmation
  iframe.addEventListener('load', () => {
    // Don't send postMessage init - rely on URL params instead
    // This avoids issues with missing apiKey/apiUrl in the payload
    loading.style.display = 'none';
  });

  // Build DOM
  container.appendChild(loading);
  container.appendChild(iframe);
  container.appendChild(closeButton);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  // Animate in
  requestAnimationFrame(() => {
    overlay.style.cssText = OVERLAY_STYLES + OVERLAY_VISIBLE_STYLES;
    container.style.cssText = MODAL_CONTAINER_STYLES + MODAL_VISIBLE_STYLES;
  });

  // Store reference
  currentModal = {
    overlay,
    iframe,
    destroy: () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      overlay.remove();
      currentModal = null;
    },
  };
}

export function closeModal(): void {
  if (currentModal) {
    currentModal.destroy();
  }
}

export function isModalOpen(): boolean {
  return currentModal !== null;
}

