/* Vitest global setup — mock heavy external deps */
import { vi } from 'vitest';

// Suppress console output during tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'debug').mockImplementation(() => {});
// Keep console.error visible for debugging
