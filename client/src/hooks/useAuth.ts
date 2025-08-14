import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const [delayComplete, setDelayComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 300); // Adjust the delay as needed
    return () => clearTimeout(timer);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: delayComplete, // Only fetch after the delay
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
