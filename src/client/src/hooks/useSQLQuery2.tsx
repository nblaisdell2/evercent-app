import {
  ReactQueryOptions,
  RouterInputs,
  RouterOutputs,
  trpc,
  TTRPC,
} from "../utils/trpc";
import { UseTRPCQueryResult } from "@trpc/react-query/dist/shared";

// NOTE: This assumes that the tRPC router is set up so that the routers are
//       all at the first level, and there is only a single level down from each
//       router to get to each procedure. If the router is set up in any other way,
//       this function will not automatically work
export function useSQLQuery2<
  T extends keyof TTRPC &
    keyof RouterInputs &
    keyof RouterOutputs &
    keyof ReactQueryOptions,
  K extends keyof TTRPC[T] &
    keyof RouterInputs[T] &
    keyof RouterOutputs[T] &
    keyof ReactQueryOptions[T],
  TDataOutput = RouterOutputs[T][K],
  TDataInput = RouterInputs[T][K]
>(
  routerQuery: T,
  procQuery: K,
  queryInput: TDataInput | undefined,
  enabled?: boolean
): UseTRPCQueryResult<TDataOutput, unknown> {
  return (trpc[routerQuery][procQuery] as any).useQuery(queryInput, {
    enabled,
  });
}
