import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    staleTime: 1000 * 60, // 1 minute
    cacheTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  },
  mutations: {
    retry: 0,
  },
});

export default queryClient;
