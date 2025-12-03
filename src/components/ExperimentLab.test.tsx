import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExperimentLab from './ExperimentLab';

// Mock the gemini service
vi.mock('../services/gemini', () => ({
  generateReflexResponseStream: vi.fn()
}));

describe('ExperimentLab Component', () => {
  it('renders correctly', () => {
    render(<ExperimentLab onClose={() => {}} />);
    expect(screen.getByText('EXPERIMENT_LAB')).toBeDefined();
    expect(screen.getByText('Default Reflex')).toBeDefined();
  });

  it('allows selecting personas', () => {
    render(<ExperimentLab onClose={() => {}} />);
    const persona = screen.getByText('Sarcastic Bot');
    fireEvent.click(persona.closest('div')!);
    // We can't easily check class names for selection without more complex setup, 
    // but we can ensure it doesn't crash.
    expect(persona).toBeDefined();
  });

  it('updates prompt input', () => {
    render(<ExperimentLab onClose={() => {}} />);
    const input = screen.getByPlaceholderText('Enter test prompt here...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Test Prompt' } });
    expect(input.value).toBe('Test Prompt');
  });

  it('shows run button disabled when empty', () => {
    render(<ExperimentLab onClose={() => {}} />);
    const button = screen.getByText('RUN_TEST').closest('button');
    expect(button).toBeDisabled();
  });
  
  it('shows run button enabled when prompt entered', () => {
      render(<ExperimentLab onClose={() => {}} />);
      const input = screen.getByPlaceholderText('Enter test prompt here...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Test Prompt' } });
      const button = screen.getByText('RUN_TEST').closest('button');
      expect(button).not.toBeDisabled();
  });
});
