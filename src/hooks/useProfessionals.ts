import { useState, useEffect } from 'react';
import type { Professional } from '../data/marketplace';

const BACKEND = 'http://localhost:3001';

interface UseProfessionalsResult {
  professionals: Professional[];
  loading: boolean;
  error: string | null;
}

export const useProfessionals = (category: string, region: string): UseProfessionalsResult => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (region && region !== 'all') params.set('region', region);

    const url = `${BACKEND}/api/professionals${params.toString() ? '?' + params.toString() : ''}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Kunde inte hämta proffs');
        return res.json();
      })
      .then(setProfessionals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [category, region]);

  return { professionals, loading, error };
};
