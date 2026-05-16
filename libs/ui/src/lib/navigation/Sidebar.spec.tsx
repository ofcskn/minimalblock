import { fireEvent, render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar.js';
import type { SidebarNode } from './sidebar.types.js';

const items: SidebarNode[] = [
  {
    id: 'catalog',
    label: 'Catalog',
    children: [
      {
        id: 'products',
        label: 'Products',
        defaultExpanded: true,
        children: [
          { id: 'gallery', label: 'Gallery', route: '/' },
          { id: 'upload', label: 'Upload', route: '/upload' },
        ],
      },
    ],
  },
];

describe('Sidebar', () => {
  it('renders nested items and selects leaf items', () => {
    const onItemSelect = jest.fn();

    render(
      <Sidebar
        items={items}
        onItemSelect={onItemSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Expand Catalog' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gallery' }));

    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'gallery', route: '/' }),
    );
  });

  it('supports keyboard navigation and nested expansion', () => {
    render(<Sidebar items={items} />);

    const catalogButton = screen.getByRole('button', { name: 'Catalog' });
    catalogButton.focus();

    fireEvent.keyDown(catalogButton, { key: 'ArrowRight' });
    const productsButton = screen.getByRole('button', { name: 'Products' });

    expect(productsButton).toBeTruthy();

    fireEvent.keyDown(productsButton, { key: 'ArrowDown' });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Gallery' }));
  });
});
