import { useAuth } from '@/contexts/AuthContext';

export function usePortfolioAPI() {
  const { token } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

  const savePortfolio = async (portfolioData: any) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${apiUrl}/portfolios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(portfolioData),
    });

    if (!response.ok) {
      throw new Error('Failed to save portfolio');
    }

    return response.json();
  };

  const updatePortfolio = async (id: number, portfolioData: any) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${apiUrl}/portfolios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(portfolioData),
    });

    if (!response.ok) {
      throw new Error('Failed to update portfolio');
    }

    return response.json();
  };

  const getPortfolios = async () => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${apiUrl}/portfolios`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch portfolios');
    }

    return response.json();
  };

  const getPortfolio = async (id: number) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${apiUrl}/portfolios/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }

    return response.json();
  };

  const deletePortfolio = async (id: number) => {
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${apiUrl}/portfolios/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete portfolio');
    }
  };

  return { savePortfolio, updatePortfolio, getPortfolios, getPortfolio, deletePortfolio };
}
