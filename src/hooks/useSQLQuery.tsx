import { QueryFunctionContext, useQuery } from "@tanstack/react-query";

export type Queries =
  | "get-all-evercent-data"
  | "update-user-details"
  | "get-budgets-list";

//   type FnInfo<T extends (...args: any) => any> = {
//     fn: T;
//     fnParams: Parameters<T>;
//     fnRetType: FnType<T>;
//   };

// type FnType<T> = T extends (...args: any) => any
//   ? FnType<ReturnType<T>>
//   : T extends Promise<infer K>
//   ? Awaited<K>
//   : T;

//   type Fn<Q extends Queries> = Q extends "get-all-evercent-data"
//     ? typeof getAllEvercentData
//     : Q extends "update-user-details"
//     ? typeof updateUserDetails
//     : Q extends "get-budgets-list"
//     ? typeof getBudgetsList
//     : never;

//   type Query<Q extends Queries, F extends (...args: any) => any> = {
//     queryKey: [Q];
//     fnData: FnInfo<F>;
//   };

export function useSQLQuery<Q extends Queries, T>(
  queryKeys: Q,
  queryFn: (context: QueryFunctionContext) => Promise<T>,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [queryKeys],
    enabled,
    queryFn,
  });
}
