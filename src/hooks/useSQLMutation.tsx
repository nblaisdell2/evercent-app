import { useEffect, useState } from "react";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

export function useSQLMutation<TDataQuery, TDataOutput>(
  mutationKeys: any[],
  mutationFn: () => Promise<TDataOutput>,
  queryKey?: QueryKey,
  invalidateQuery?: boolean,
  updateFn?: (old: TDataQuery | undefined) => TDataQuery | undefined,
  errRollbackDelay?: number,
  errRollbackFn?: () => Promise<void>
) {
  const queryClient = useQueryClient();

  const { mutate, isError } = useMutation<TDataOutput, unknown, void, unknown>(
    mutationKeys,
    mutationFn,
    {
      onSettled: async (newData, error, variables, context) => {
        if (queryKey) {
          // Cancel any outgoing refetches
          // (so they don't overwrite our optimistic update)
          await queryClient.cancelQueries({ queryKey });

          // Snapshot the previous value
          const prevData = queryClient.getQueryData(queryKey);

          if (error) {
            queryClient.setQueryData(queryKey, prevData);
          } else {
            if (updateFn) queryClient.setQueryData(queryKey, updateFn);
          }

          if (invalidateQuery) {
            await queryClient.invalidateQueries({ queryKey });
          }
        }
      },
    }
  );

  const [foundError, setFoundError] = useState(false);
  
  useEffect(() => {
    if (queryKey && isError) {
      const timer = window.setTimeout(() => {
        setFoundError(false);
        if (errRollbackFn) errRollbackFn();
      }, errRollbackDelay);

      setFoundError(true);

      return () => {
        // Return callback to run on unmount.
        window.clearTimeout(timer);
      };
    }
  }, [isError]);

  return { mutate: mutate, error: foundError };
}
