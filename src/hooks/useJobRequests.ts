import { useState, useEffect, useCallback } from 'react';

const BACKEND = 'http://localhost:3001';

interface JobRequest {
  id: number;
  created_at: string;
  title: string;
  description: string;
  category: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  interest_count: number;
  my_interest: number;
}

interface UseJobRequestsResult {
  jobs: JobRequest[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useJobRequests = (token: string | null, categoryFilter: string): UseJobRequestsResult => {
  const [jobs, setJobs] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!token) return;

    const url =
      categoryFilter === 'all'
        ? `${BACKEND}/api/job-requests`
        : `${BACKEND}/api/job-requests?category=${categoryFilter}`;

    setLoading(true);
    setError(null);

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Kunde inte hämta jobbförfrågningar');
        return res.json();
      })
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, categoryFilter, tick]);

  return { jobs, loading, error, refetch };
};
