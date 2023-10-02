import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import { Queries } from "./useEvercent";

export function useSQLQuery<T>(
  queryKeys: Queries,
  queryFn: (context: QueryFunctionContext) => Promise<T>,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [queryKeys],
    enabled,
    queryFn,
  });
}
