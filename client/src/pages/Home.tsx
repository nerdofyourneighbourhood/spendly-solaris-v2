import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // This page is not used - the app is rendered directly in App.tsx
    // This is just a placeholder for the router
  }, []);

  return null;
}
