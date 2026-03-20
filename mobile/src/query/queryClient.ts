import { QueryClient } from '@tanstack/react-query';

// Shared singleton for the whole app. Mounted by the root provider in `T-031`.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid aggressive refetching; premium UX favors stable UI with explicit refresh.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * (attemptIndex + 1), 3000)
    },
    mutations: {
      retry: 0
    }
  }
});

