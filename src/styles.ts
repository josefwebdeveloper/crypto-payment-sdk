/**
 * Inline styles for the modal overlay and iframe
 * These are injected dynamically to avoid external CSS dependencies
 */

export const OVERLAY_STYLES = `
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  opacity: 0;
  transition: opacity 0.2s ease-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const OVERLAY_VISIBLE_STYLES = `
  opacity: 1;
`;

export const MODAL_CONTAINER_STYLES = `
  position: relative;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  margin: 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  transform: scale(0.95) translateY(10px);
  transition: transform 0.2s ease-out;
`;

export const MODAL_VISIBLE_STYLES = `
  transform: scale(1) translateY(0);
`;

export const IFRAME_STYLES = `
  width: 100%;
  height: 600px;
  border: none;
  background: #111827;
  border-radius: 16px;
`;

export const CLOSE_BUTTON_STYLES = `
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
  z-index: 10;
`;

export const CLOSE_BUTTON_HOVER_STYLES = `
  background: rgba(255, 255, 255, 0.2);
`;

export const CLOSE_ICON_SVG = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
`;

export const LOADING_STYLES = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #10b981;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

export const SPINNER_STYLES = `
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: cryptopay-spin 0.8s linear infinite;
`;

export const KEYFRAMES = `
  @keyframes cryptopay-spin {
    to { transform: rotate(360deg); }
  }
`;

