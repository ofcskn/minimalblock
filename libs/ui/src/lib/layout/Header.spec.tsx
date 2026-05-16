import { fireEvent, render, screen } from '@testing-library/react';
import { Header } from './Header.js';

describe('Header', () => {
  it('filters search results and emits selection callbacks', () => {
    const onSearchSelect = jest.fn();

    render(
      <Header
        brand={{ title: 'Minimal Block' }}
        onSearchSelect={onSearchSelect}
        search={{
          placeholder: 'Search products, orders, customers...',
          scopes: [
            { id: 'all', label: 'All' },
            { id: 'products', label: 'Products' },
          ],
          results: [
            {
              id: 'chair',
              label: 'Premium Oak Chair',
              description: 'Top seller',
              scopeId: 'products',
            },
          ],
        }}
        title="Orders"
      />,
    );

    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'oak' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Premium Oak Chair/i }));

    expect(onSearchSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'chair' }),
    );
  });

  it('exposes notification and profile menu actions', () => {
    const onNotificationMarkRead = jest.fn();
    const onProfileAction = jest.fn();

    render(
      <Header
        brand={{ title: 'Minimal Block' }}
        notifications={[
          {
            id: 'new-order',
            label: 'New order received',
            title: 'New order received',
            description: 'Order #1048 is ready.',
            isRead: false,
          },
        ]}
        onNotificationMarkRead={onNotificationMarkRead}
        onProfileAction={onProfileAction}
        profile={{
          name: 'Avery Chen',
          email: 'avery@minimalblock.com',
          actions: [{ id: 'sign-out', label: 'Sign out' }],
        }}
        title="Orders"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open notifications' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mark as read' }));

    expect(onNotificationMarkRead).toHaveBeenCalledWith('new-order');

    fireEvent.click(screen.getByRole('button', { name: /Avery Chen/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(onProfileAction).toHaveBeenCalledWith('sign-out');
  });
});
