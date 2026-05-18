import { render, screen, fireEvent } from '@testing-library/react';
import { SourceImageReadiness } from '@minimalblock/core';
import { SourceImageReadinessCard } from './SourceImageReadinessCard.js';

function makeReadiness(assets: Array<{ storageKey: string; sizeBytes?: number }>) {
  return SourceImageReadiness.fromMediaAssets(
    assets.map((a) => ({ storageKey: a.storageKey, url: `https://cdn/${a.storageKey}`, sizeBytes: a.sizeBytes ?? 200_000 })),
  );
}

describe('SourceImageReadinessCard', () => {
  it('renders the card container', () => {
    const { container } = render(<SourceImageReadinessCard readiness={makeReadiness([])} />);
    expect(container.querySelector('[data-testid="source-image-readiness-card"]')).toBeTruthy();
  });

  it('shows score 100 for front + back + detail', () => {
    const readiness = makeReadiness([
      { storageKey: 'seller/front.jpg' },
      { storageKey: 'seller/back.jpg' },
      { storageKey: 'seller/detail.jpg' },
    ]);
    render(<SourceImageReadinessCard readiness={readiness} />);
    const score = screen.getByTestId('readiness-score');
    expect(score.textContent).toContain('100');
  });

  it('shows score 0 for empty assets', () => {
    render(<SourceImageReadinessCard readiness={makeReadiness([])} />);
    const score = screen.getByTestId('readiness-score');
    expect(score.textContent).toContain('0');
  });

  it('renders checklist items for all 8 views', () => {
    const { container } = render(<SourceImageReadinessCard readiness={makeReadiness([])} />);
    const views = ['front', 'back', 'left', 'right', 'top', 'bottom', 'detail', 'scale'];
    views.forEach((v) => {
      expect(container.querySelector(`[data-testid="checklist-${v}"]`)).toBeTruthy();
    });
  });

  it('marks covered views with checkmark text', () => {
    const readiness = makeReadiness([{ storageKey: 'seller/front.jpg' }]);
    const { container } = render(<SourceImageReadinessCard readiness={readiness} />);
    const frontItem = container.querySelector('[data-testid="checklist-front"]');
    expect(frontItem?.textContent).toContain('✓');
  });

  it('marks missing required views as Required', () => {
    const { container } = render(<SourceImageReadinessCard readiness={makeReadiness([])} />);
    expect(container.querySelector('[data-testid="checklist-front"]')?.textContent).toContain('Required');
    expect(container.querySelector('[data-testid="checklist-back"]')?.textContent).toContain('Required');
  });

  it('does not mark non-required missing views as Required', () => {
    const { container } = render(<SourceImageReadinessCard readiness={makeReadiness([])} />);
    expect(container.querySelector('[data-testid="checklist-left"]')?.textContent).not.toContain('Required');
  });

  it('shows image entries when assets provided', () => {
    const readiness = makeReadiness([{ storageKey: 'seller/front.jpg' }]);
    const { container } = render(<SourceImageReadinessCard readiness={readiness} />);
    expect(container.querySelectorAll('[data-testid="image-entry"]')).toHaveLength(1);
  });

  it('calls onUploadMissingViews when button clicked', () => {
    const handler = jest.fn();
    render(<SourceImageReadinessCard readiness={makeReadiness([])} onUploadMissingViews={handler} />);
    fireEvent.click(screen.getByTestId('upload-missing-btn'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls onRemoveWeakImages with storage keys of weak images', () => {
    const handler = jest.fn();
    const readiness = makeReadiness([{ storageKey: 'seller/image001.jpg', sizeBytes: 10_000 }]);
    render(<SourceImageReadinessCard readiness={readiness} onRemoveWeakImages={handler} />);
    fireEvent.click(screen.getByTestId('remove-weak-btn'));
    expect(handler).toHaveBeenCalledWith(expect.arrayContaining(['seller/image001.jpg']));
  });

  it('hides upload-missing-btn when no missing views remain', () => {
    const readiness = SourceImageReadiness.fromEntries([
      { storageKey: 'f', url: 'f', sizeBytes: 1, viewLabel: 'front', warnings: [] },
      { storageKey: 'b', url: 'b', sizeBytes: 1, viewLabel: 'back', warnings: [] },
      { storageKey: 'l', url: 'l', sizeBytes: 1, viewLabel: 'left', warnings: [] },
      { storageKey: 'r', url: 'r', sizeBytes: 1, viewLabel: 'right', warnings: [] },
      { storageKey: 't', url: 't', sizeBytes: 1, viewLabel: 'top', warnings: [] },
      { storageKey: 'bo', url: 'bo', sizeBytes: 1, viewLabel: 'bottom', warnings: [] },
      { storageKey: 'd', url: 'd', sizeBytes: 1, viewLabel: 'detail', warnings: [] },
      { storageKey: 's', url: 's', sizeBytes: 1, viewLabel: 'scale', warnings: [] },
    ]);
    const { container } = render(
      <SourceImageReadinessCard readiness={readiness} onUploadMissingViews={jest.fn()} />,
    );
    expect(container.querySelector('[data-testid="upload-missing-btn"]')).toBeNull();
  });

  it('hides continue-anyway when score >= 70', () => {
    const readiness = makeReadiness([
      { storageKey: 'seller/front.jpg' },
      { storageKey: 'seller/back.jpg' },
      { storageKey: 'seller/detail.jpg' },
    ]);
    const { container } = render(
      <SourceImageReadinessCard readiness={readiness} onContinueAnyway={jest.fn()} />,
    );
    expect(container.querySelector('[data-testid="continue-anyway-btn"]')).toBeNull();
  });

  it('shows continue-anyway when score < 70', () => {
    const { container } = render(
      <SourceImageReadinessCard readiness={makeReadiness([])} onContinueAnyway={jest.fn()} />,
    );
    expect(container.querySelector('[data-testid="continue-anyway-btn"]')).toBeTruthy();
  });
});
