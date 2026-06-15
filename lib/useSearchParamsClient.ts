import { useSearchParams as useSearchParamsNext } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useSearchParamsClient() {
  const searchParams = useSearchParamsNext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return new URLSearchParams();
  }

  return searchParams;
}
