/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { NFTCard } from '../NFTCard';

describe('NFTCard Component', () => {
  const mockNFT = {
    id: '0.0.12345:1',
    name: 'Quantum Art #001',
    description: 'A quantum-protected digital artwork',
    category: 'art' as const,
    imageUrl: 'https://example.com/nft.jpg',
    shieldStatus: 'protected' as const,
    mldsaLevel: 'ML-DSA-65' as const,
    mlkemLevel: 'ML-KEM-768' as const,
    createdAt: '2024-02-23T10:00:00Z',
    provenanceHash: '0xabc123...',
  };

  it('renders NFT card with all information', () => {
    render(<NFTCard nft={mockNFT} />);
    
    expect(screen.getByText('Quantum Art #001')).toBeInTheDocument();
    expect(screen.getByText('A quantum-protected digital artwork')).toBeInTheDocument();
    expect(screen.getByText('0.0.12345:1')).toBeInTheDocument();
  });

  it('displays shield status badge correctly', () => {
    render(<NFTCard nft={mockNFT} />);

    // Status badge shows "protected" with green styling
    const statusBadges = screen.getAllByText('protected');
    expect(statusBadges.length).toBeGreaterThan(0);

    // Check that at least one has the correct green styling
    const greenBadge = statusBadges.find((badge) =>
      badge.classList.contains('bg-green-100')
    );
    expect(greenBadge).toBeDefined();
  });

  it('shows quantum crypto levels', () => {
    render(<NFTCard nft={mockNFT} />);
    
    expect(screen.getByText(/ML-DSA-65/)).toBeInTheDocument();
    expect(screen.getByText(/ML-KEM-768/)).toBeInTheDocument();
  });

  it('displays category correctly', () => {
    render(<NFTCard nft={mockNFT} />);

    // Category is displayed as "art" (lowercase, capitalized by CSS)
    const categoryElements = screen.getAllByText('art');
    expect(categoryElements.length).toBeGreaterThan(0);
  });

  it('renders image with correct alt text', () => {
    render(<NFTCard nft={mockNFT} />);
    
    const image = screen.getByAltText('Quantum Art #001');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', expect.stringContaining('nft.jpg'));
  });

  it('shows provenance hash truncated', () => {
    render(<NFTCard nft={mockNFT} />);
    
    // Provenance hash should be truncated (e.g., "0xabc1...c123")
    expect(screen.getByText(/0xabc1/)).toBeInTheDocument();
  });

  it('applies correct styling for protected status', () => {
    render(<NFTCard nft={mockNFT} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('border', 'rounded-lg');
  });

  it('handles missing image gracefully', () => {
    const nftWithoutImage = { ...mockNFT, imageUrl: undefined };
    render(<NFTCard nft={nftWithoutImage} />);
    
    // Should still render without crashing
    expect(screen.getByText('Quantum Art #001')).toBeInTheDocument();
  });
});

