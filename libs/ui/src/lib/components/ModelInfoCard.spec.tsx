import { render, screen } from '@testing-library/react';
import { ModelInfoCard } from './ModelInfoCard.js';

const baseProps = {
  fileName: 'ceramic-vase.glb',
  fileSizeBytes: 1_536_000,
  uploadedAt: new Date('2026-05-18T11:00:00.000Z'),
  modelSource: 'ai-generated' as const,
};

describe('ModelInfoCard', () => {
  it('renders file name', () => {
    render(<ModelInfoCard {...baseProps} />);
    expect(screen.getByText('ceramic-vase.glb')).toBeTruthy();
  });

  it('renders file size in MB', () => {
    render(<ModelInfoCard {...baseProps} />);
    expect(screen.getByText('1.46 MB')).toBeTruthy();
  });

  it('shows AI-generated badge when modelSource is ai-generated', () => {
    render(<ModelInfoCard {...baseProps} />);
    expect(screen.getByText('AI-generated')).toBeTruthy();
  });

  it('shows Manual fallback badge when modelSource is manual-fallback', () => {
    render(<ModelInfoCard {...baseProps} modelSource="manual-fallback" />);
    expect(screen.getByText('Manual fallback')).toBeTruthy();
  });

  it('shows reset camera button when onResetCamera is provided', () => {
    const onReset = jest.fn();
    render(<ModelInfoCard {...baseProps} onResetCamera={onReset} />);
    expect(screen.getByRole('button', { name: /reset camera/i })).toBeTruthy();
  });

  it('does not show reset camera button when onResetCamera is not provided', () => {
    render(<ModelInfoCard {...baseProps} />);
    expect(screen.queryByRole('button', { name: /reset camera/i })).toBeNull();
  });

  it('calls onResetCamera when reset camera button is clicked', () => {
    const onReset = jest.fn();
    const { getByRole } = render(<ModelInfoCard {...baseProps} onResetCamera={onReset} />);
    getByRole('button', { name: /reset camera/i }).click();
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
