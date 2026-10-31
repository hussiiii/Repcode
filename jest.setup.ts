import { afterEach, jest as jestRunner } from '@jest/globals';
import '@testing-library/jest-dom';

afterEach(() => {
  jestRunner.restoreAllMocks();
});

// jsdom omits these browser APIs used by Radix measurement and focus handling.
// Real browser implementations remain untouched.
if (typeof window !== 'undefined') {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
  if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
  if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {};
  if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {};
}
