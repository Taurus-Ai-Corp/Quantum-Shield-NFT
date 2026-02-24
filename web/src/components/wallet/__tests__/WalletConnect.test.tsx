/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WalletConnect } from '../WalletConnect';

describe('WalletConnect Component', () => {
  it('renders connect button when wallet is not connected', () => {
    render(<WalletConnect />);
    
    const button = screen.getByRole('button', { name: /connect wallet/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Connect Wallet');
  });

  it('displays account ID when wallet is connected', async () => {
    const { rerender } = render(<WalletConnect />);
    
    // Simulate wallet connection by clicking button
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectButton);
    
    // Wait for connection to complete (mocked to return 0.0.12345)
    await waitFor(() => {
      expect(screen.queryByText(/0\.0\.\d+/)).toBeInTheDocument();
    });
  });

  it('handles disconnect correctly', async () => {
    render(<WalletConnect />);
    
    // Connect first
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/0\.0\.\d+/)).toBeInTheDocument();
    });
    
    // Now disconnect
    const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
    fireEvent.click(disconnectButton);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
    });
  });

  it('displays account ID with correct styling when connected', async () => {
    render(<WalletConnect />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      const accountDisplay = screen.getByText(/0\.0\.\d+/);
      expect(accountDisplay).toBeInTheDocument();
      expect(accountDisplay).toHaveClass('px-3');
      expect(accountDisplay).toHaveClass('py-1.5');
    });
  });

  it('shows disconnect button after successful connection', async () => {
    render(<WalletConnect />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    fireEvent.click(connectButton);

    await waitFor(() => {
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
      expect(disconnectButton).toBeInTheDocument();
    });
  });
});

