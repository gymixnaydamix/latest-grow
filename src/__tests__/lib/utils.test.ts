import { cn } from '@/lib/utils';

describe('cn (class name merge utility)', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resolves conflicting Tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('handles conditional/falsy values', () => {
    expect(cn('base', false && 'hidden', undefined, null, 'visible')).toBe('base visible');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('merges array inputs', () => {
    expect(cn(['flex', 'gap-2'], 'p-4')).toBe('flex gap-2 p-4');
  });
});
