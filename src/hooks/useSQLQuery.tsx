import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

export function useSQLQuery<T>(
  queryKeys: any[],
  queryFn: (context: QueryFunctionContext) => Promise<T>,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys,
    enabled,
    queryFn,
  });
}
