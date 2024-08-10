import { Updater } from "@tanstack/react-query";
import {
  ReactQueryOptions,
  RouterInputs,
  RouterOutputs,
  trpc,
  TTRPC,
  // UTRPC,
} from "../utils/trpc";
import { logError } from "../utils/log";
import { useAuth0 } from "@auth0/auth0-react";
import { UseTRPCMutationResult } from "@trpc/react-query/dist/shared";

// NOTE: This assumes that the tRPC router is set up so that the routers are
//       all at the first level, and there is only a single level down from each
//       router to get to each procedure. If the router is set up in any other way,
//       this function will not automatically work
export function useSQLMutation2<
  T extends keyof TTRPC &
    keyof RouterInputs &
    keyof RouterOutputs &
    keyof ReactQueryOptions,
  K extends keyof TTRPC[T] &
    keyof RouterInputs[T] &
    keyof RouterOutputs[T] &
    keyof ReactQueryOptions[T],
  T2 extends keyof TTRPC &
    keyof RouterInputs &
    keyof RouterOutputs &
    keyof ReactQueryOptions,
  K2 extends keyof TTRPC[T2] &
    keyof RouterInputs[T2] &
    keyof RouterOutputs[T2] &
    keyof ReactQueryOptions[T2],
  TVariables extends RouterInputs[T][K],
  TDataOutput = RouterOutputs[T][K],
  TDataQuery = RouterOutputs[T2][K2]
>(
  routerMut: T,
  procMut: K,
  routerQuery?: T2,
  procQuery?: K2,
  invalidateQuery?: boolean,
  updateFn?: (
    old: TDataQuery | undefined,
    newData: TDataOutput | undefined
  ) => TDataQuery | undefined,
  errRollbackDelay?: number,
  errRollbackFn?: () => Promise<void>
): UseTRPCMutationResult<TDataOutput, any, TVariables, any> {
  const { user } = useAuth0();
  const utils = trpc.useUtils();
  const email = {
    userEmail: user?.email as string,
  };

  const optimistic = () => {
    if (!routerQuery || !procQuery) return;

    const { query, queryKey } = {
      query: (utils as any)[routerQuery][procQuery] as any,
      queryKey: email,
    };

    return async (res: any, error: any): Promise<void> => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      query.cancel();

      // Snapshot the previous value
      const prevData = query.getData(queryKey) as TDataQuery;

      // Then, update the cached data accordingly
      //   If there's an error, log the error and revert the cached data back to the previous value
      //   If we should invalidate the data, simply re-run the query to re-cache the data
      //   Otherwise, if given an update function, use it to update the cached data
      if (error || res?.err) {
        logError(error ?? res?.err);
        query.setData(queryKey, prevData as Updater<TDataQuery, any>);
      } else if (invalidateQuery) {
        query.invalidate();
      } else if (updateFn) {
        query.setData(
          queryKey,
          updateFn(prevData, res?.data) as Updater<TDataQuery, any>
        );
      }
    };
  };

  // const [foundError, setFoundError] = useState(false);

  // useEffect(() => {
  //   if (queryKey && isError) {
  //     const timer = window.setTimeout(() => {
  //       setFoundError(false);
  //       if (errRollbackFn) errRollbackFn();
  //     }, errRollbackDelay);

  //     setFoundError(true);

  //     return () => {
  //       // Return callback to run on unmount.
  //       window.clearTimeout(timer);
  //     };
  //   }
  // }, [isError]);

  return (trpc[routerMut][procMut] as any).useMutation({
    onSettled: optimistic(),
  });
}
