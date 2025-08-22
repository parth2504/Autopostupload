import { describe, it, expect } from 'vitest';

// Utility functions for testing date/time functionality
export const createFutureDate = (minutesFromNow: number): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutesFromNow);
  return date;
};

export const createPastDate = (minutesAgo: number): Date => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date;
};

export const formatDateTimeLocal = (date: Date): string => {
  return date.toISOString().slice(0, 16);
};

describe('Test utilities', () => {
  it('creates future dates correctly', () => {
    const futureDate = createFutureDate(30);
    const now = new Date();
    expect(futureDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it('creates past dates correctly', () => {
    const pastDate = createPastDate(30);
    const now = new Date();
    expect(pastDate.getTime()).toBeLessThan(now.getTime());
  });

  it('formats datetime-local correctly', () => {
    const date = new Date('2024-01-15T10:30:00Z'); // Use UTC to avoid timezone issues
    const formatted = formatDateTimeLocal(date);
    expect(formatted).toBe('2024-01-15T10:30');
  });
});