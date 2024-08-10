import { useEffect, useState } from "react";
import {
  MutationFunction,
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export type Queries =
  | "get-all-evercent-data"
  | "update-user-details"
  | "update-months-ahead"
  | "update-categories"
  | "connect-to-ynab"
  | "switch-budget"
  | "update-budget-category-amount"
  | "get-budgets-list"
  | "save-auto-run-details"
  | "cancel-auto-runs";

export type FnType<T> = T extends (...args: any) => any
  ? FnType<ReturnType<T>>
  : T extends Promise<infer K>
  ? Awaited<K>
  : T;

// export type Fn<Q extends Queries> = Q extends "get-all-evercent-data"
//   ? EvercentData
//   : Q extends "update-user-details"
//   ? typeof updateUserDetails
//   : Q extends "update-months-ahead"
//   ? typeof updateMonthsAheadTarget
//   : Q extends "get-budgets-list"
//   ? typeof getBudgetsList
//   : Q extends "update-categories"
//   ? typeof updateCategoryData
//   : Q extends "update-budget-category-amount"
//   ? typeof updateBudgetCategoryAmount
//   : Q extends "switch-budget"
//   ? typeof switchBudget
//   : Q extends "connect-to-ynab"
//   ? typeof connectToYNAB
//   : Q extends "save-auto-run-details"
//   ? typeof saveAutoRunDetails
//   : Q extends "cancel-auto-runs"
//   ? typeof cancelAutoRuns
//   : never;

export function useSQLMutation<
  Q extends Queries,
  TDataOutput,
  TVariables,
  TDataQuery = any //FnType<Fn<Q>>
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

  const { mutateAsync, isError, error, data } = useMutation<
    TDataOutput,
    unknown,
    TVariables,
    unknown
  >([mutationKeys], mutationFn, {
    onSettled: async (newData, error) => {
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
