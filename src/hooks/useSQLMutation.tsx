import { useEffect, useState } from "react";
import {
  MutationFunction,
  UseMutateAsyncFunction,
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Fn, FnType, Queries } from "./useEvercent";
import { log } from "console";

export function useSQLMutation<
  Q extends Queries,
  TDataOutput,
  TVariables,
  TDataQuery = FnType<Fn<Q>>
>(
  mutationKeys: Q,
  mutationFn: MutationFunction<TDataOutput, TVariables>,
  queryKey?: Q,
  invalidateQuery?: boolean,
  updateFn?: (
    old: TDataQuery | undefined,
    newData: TDataOutput | undefined
  ) => TDataQuery | undefined,
  errRollbackDelay?: number,
  errRollbackFn?: () => Promise<void>
): {
  mutate: UseMutateAsyncFunction<TDataOutput, unknown, TVariables, unknown>;
  error: boolean;
  data: TDataOutput | undefined;
  mutError: unknown;
} {
  const queryClient = useQueryClient();

  const { mutate, mutateAsync, isError, error, data, isLoading } = useMutation<
    TDataOutput,
    unknown,
    TVariables,
    unknown
  >([mutationKeys], mutationFn, {
    onSettled: async (newData, error, variables, context) => {
      if (queryKey) {
        // Cancel any outgoing refetches
        // (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({ queryKey: [queryKey] });

        // Snapshot the previous value
        const prevData = queryClient.getQueryData<TDataQuery | undefined>([
          queryKey,
        ]);

        if (error) {
          queryClient.setQueryData([queryKey], prevData);
        } else {
          if (updateFn)
            queryClient.setQueryData([queryKey], updateFn(prevData, newData));
        }

        if (invalidateQuery) {
          await queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      }
    },
  });

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

  return {
    mutate: mutateAsync,
    error: foundError,
    data,
    mutError: error,
  };
}
