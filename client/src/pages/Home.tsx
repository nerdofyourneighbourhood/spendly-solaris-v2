import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if authenticated
    if (!loading && user) {
      setLocation('/dashboard');
    }
  }, [user, loading, setLocation]);

  return null;
}
