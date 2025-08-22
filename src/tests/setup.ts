import '@testing-library/jest-dom';

// Mock window.alert for tests
Object.defineProperty(window, 'alert', {
  value: () => {},
  writable: true,
});

// Mock IntersectionObserver with required properties for TS
class MockIntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
}
// @ts-ignore
global.IntersectionObserver = MockIntersectionObserver;
// @ts-ignore
global.IntersectionObserver.prototype = MockIntersectionObserver.prototype;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});