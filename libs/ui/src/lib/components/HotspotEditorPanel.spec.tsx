import { render, screen, fireEvent } from '@testing-library/react';
import { HotspotEditorPanel } from './HotspotEditorPanel.js';
import type { Hotspot } from '@minimalblock/core';

function makeHotspot(overrides: Partial<Hotspot> = {}): Hotspot {
  return {
    id: 'h-1',
    label: 'Anodized Aluminum Frame',
    description: 'Lightweight aerospace-grade aluminium resists dents and scratches.',
    type: 'material',
    position: '0.1 0.2 0.3',
    normal: '0 1 0',
    approved: false,
    ...overrides,
  };
}

const noop = () => undefined;

describe('HotspotEditorPanel', () => {
  describe('F.1 — show all hotspots in a clear list', () => {
    it('renders every hotspot label', () => {
      const hotspots = [
        makeHotspot({ id: 'h-1', label: 'USB-C Port' }),
        makeHotspot({ id: 'h-2', label: 'Keyboard Layout' }),
      ];
      render(
        <HotspotEditorPanel
          hotspots={hotspots}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      expect(screen.getByText('USB-C Port')).toBeDefined();
      expect(screen.getByText('Keyboard Layout')).toBeDefined();
    });

    it('shows empty state when no hotspots exist', () => {
      render(
        <HotspotEditorPanel
          hotspots={[]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      expect(screen.getByText(/No hotspots yet/)).toBeDefined();
    });

    it('shows hotspot count in header', () => {
      const hotspots = [makeHotspot(), makeHotspot({ id: 'h-2', label: 'Screen Hinge' })];
      render(
        <HotspotEditorPanel
          hotspots={hotspots}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      expect(screen.getByText('2 hotspots')).toBeDefined();
    });
  });

  describe('F.5 — approval toggle', () => {
    it('calls onApprovalToggle with true when clicking Approve', () => {
      const onApprovalToggle = jest.fn();
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ approved: false })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={onApprovalToggle}
        />,
      );
      fireEvent.click(screen.getByText('Approve'));
      expect(onApprovalToggle).toHaveBeenCalledWith('h-1', true);
    });

    it('calls onApprovalToggle with false when clicking Approved (revoke)', () => {
      const onApprovalToggle = jest.fn();
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ approved: true })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={onApprovalToggle}
        />,
      );
      fireEvent.click(screen.getByText('Approved'));
      expect(onApprovalToggle).toHaveBeenCalledWith('h-1', false);
    });
  });

  describe('F.6 — deletion', () => {
    it('calls onDelete with the hotspot id', () => {
      const onDelete = jest.fn();
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot()]}
          onUpdate={noop}
          onDelete={onDelete}
          onApprovalToggle={noop}
        />,
      );
      fireEvent.click(screen.getByText('Delete'));
      expect(onDelete).toHaveBeenCalledWith('h-1');
    });
  });

  describe('F.8/F.17/F.18 — quality status visual', () => {
    it('shows "invalid" count badge when there are invalid hotspots', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ label: '' })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      expect(screen.getByText('1 invalid')).toBeDefined();
    });

    it('shows "warning" count badge when there are hotspot warnings', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ type: undefined })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      expect(screen.getByText('1 warning')).toBeDefined();
    });
  });

  describe('F.19 — publish block banner', () => {
    it('shows publish-blocked banner when publishBlocked and invalid hotspots exist', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ label: '' })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
          publishBlocked
        />,
      );
      expect(screen.getByText(/Publish blocked/)).toBeDefined();
    });

    it('does not show publish-blocked banner when all hotspots are valid', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot()]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
          publishBlocked
        />,
      );
      expect(screen.queryByText(/Publish blocked/)).toBeNull();
    });
  });

  describe('F.20/F.21 — action buttons', () => {
    it('renders "Validate hotspots" button when onValidate is provided', () => {
      const onValidate = jest.fn();
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot()]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
          onValidate={onValidate}
        />,
      );
      fireEvent.click(screen.getByText('Validate hotspots'));
      expect(onValidate).toHaveBeenCalled();
    });

    it('renders "Generate better" button when onGenerateBetter is provided', () => {
      const onGenerateBetter = jest.fn();
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot()]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
          onGenerateBetter={onGenerateBetter}
        />,
      );
      fireEvent.click(screen.getByText('Generate better'));
      expect(onGenerateBetter).toHaveBeenCalled();
    });
  });

  describe('inline editing (F.2/F.3/F.4)', () => {
    it('switches to edit form when clicking Edit', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot()]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByPlaceholderText('Hotspot label…')).toBeDefined();
    });

    it('calls onUpdate with new label when saving', () => {
      const onUpdate = jest.fn();
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ label: 'Old Label' })]}
          onUpdate={onUpdate}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      fireEvent.click(screen.getByText('Edit'));
      const input = screen.getByPlaceholderText('Hotspot label…') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'New Label' } });
      fireEvent.click(screen.getByText('Save'));
      expect(onUpdate).toHaveBeenCalledWith('h-1', expect.objectContaining({ label: 'New Label' }));
    });

    it('disables Save when label is empty', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ label: 'Some Label' })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      fireEvent.click(screen.getByText('Edit'));
      const input = screen.getByPlaceholderText('Hotspot label…') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '' } });
      const saveBtn = screen.getByText('Save').closest('button') as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(true);
    });

    it('cancels edit and reverts state', () => {
      render(
        <HotspotEditorPanel
          hotspots={[makeHotspot({ label: 'Original' })]}
          onUpdate={noop}
          onDelete={noop}
          onApprovalToggle={noop}
        />,
      );
      fireEvent.click(screen.getByText('Edit'));
      const input = screen.getByPlaceholderText('Hotspot label…') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Changed' } });
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.getByText('Original')).toBeDefined();
    });
  });
});
