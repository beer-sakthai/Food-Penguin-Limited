import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Barcode } from './Barcode';
import React from 'react';

describe('Barcode Component', () => {
  it('renders the barcode value', () => {
    const testValue = '1234567890123';
    render(<Barcode value={testValue} isLight={true} />);

    expect(screen.getByText(testValue)).toBeInTheDocument();
  });

  it('applies light theme styles when isLight is true', () => {
    const { container } = render(<Barcode value="12345" isLight={true} />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('bg-zinc-100');
    expect(wrapper).toHaveClass('text-zinc-800');
    expect(wrapper).toHaveClass('border-zinc-200');
  });

  it('applies dark theme styles when isLight is false', () => {
    const { container } = render(<Barcode value="12345" isLight={false} />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass('bg-[#18181b]');
    expect(wrapper).toHaveClass('text-white');
    expect(wrapper).toHaveClass('border-zinc-800');
  });

  it('renders the correct number of bars (bits)', () => {
    // pattern length = 3 (start) + (value.length * 7) + (if i==6, 5 mid) + 3 (end)
    // For value "12345678" (length 8):
    // 3 + (8 * 7) + 5 (at i=6) + 3 = 3 + 56 + 5 + 3 = 67 bits
    const { container } = render(<Barcode value="12345678" isLight={true} />);
    const bars = container.querySelectorAll('.flex-1');

    expect(bars.length).toBe(67);
  });

  it('renders bars for shorter value', () => {
    // For value "123" (length 3):
    // 3 + (3 * 7) + 0 (no i=6) + 3 = 3 + 21 + 3 = 27 bits
    const { container } = render(<Barcode value="123" isLight={true} />);
    const bars = container.querySelectorAll('.flex-1');

    expect(bars.length).toBe(27);
  });

  it('handles non-numeric characters by defaulting to 0', () => {
    // For value "A" (length 1):
    // num = parseInt("A", 10) || 0 => 0
    // 3 + (1 * 7) + 3 = 13 bits
    const { container } = render(<Barcode value="A" isLight={true} />);
    const bars = container.querySelectorAll('.flex-1');
    expect(bars.length).toBe(13);

    // First value code for 0 is [0,0,0,1,1,0,1]
    // Total pattern: [1,0,1, 0,0,0,1,1,0,1, 1,0,1]
    // Bits at index 3, 4, 5 should be 0 (bg-transparent)
    expect(bars[3]).toHaveClass('bg-transparent');
    expect(bars[4]).toHaveClass('bg-transparent');
    expect(bars[5]).toHaveClass('bg-transparent');
    expect(bars[6]).toHaveClass('bg-black');
  });
});
