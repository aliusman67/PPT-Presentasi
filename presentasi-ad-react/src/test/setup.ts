import '@testing-library/jest-dom/vitest';

// Fake timers yang lupa di-reset tidak boleh merembet ke test berikutnya.
afterEach(() => {
  vi.useRealTimers();
});
