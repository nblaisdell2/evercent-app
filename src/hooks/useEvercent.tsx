import {
  EvercentData,
  getAllEvercentData,
  updateCachedCategories,
  updateCachedUserData,
} from "../model/evercent";
import { updateMonthsAheadTarget, updateUserDetails } from "../model/userData";
import { useSQLQuery } from "./useSQLQuery";
import { updateCategoryData } from "../model/category";
import { log } from "../utils/log";
import { useAuth0 } from "@auth0/auth0-react";
import { useSQLMutation } from "./useSQLMutation";
import {
  connectToYNAB,
  getBudgetsList,
  switchBudget,
  updateBudgetCategoryAmount,
} from "../model/budget";
import { useState } from "react";

export type Queries =
  | "get-all-evercent-data"
  | "update-user-details"
  | "update-months-ahead"
  | "update-categories"
  | "connect-to-ynab"
  | "switch-budget"
  | "update-budget-category-amount"
  | "get-budgets-list";

export type Fn<Q extends Queries> = Q extends "get-all-evercent-data"
  ? EvercentData
  : Q extends "update-user-details"
  ? typeof updateUserDetails
  : Q extends "update-months-ahead"
  ? typeof updateMonthsAheadTarget
  : Q extends "get-budgets-list"
  ? typeof getBudgetsList
  : Q extends "update-categories"
  ? typeof updateCategoryData
  : Q extends "update-budget-category-amount"
  ? typeof updateBudgetCategoryAmount
  : Q extends "switch-budget"
  ? typeof switchBudget
  : Q extends "connect-to-ynab"
  ? typeof connectToYNAB
  : never;

export type FnType<T> = T extends (...args: any) => any
  ? FnType<ReturnType<T>>
  : T extends Promise<infer K>
  ? Awaited<K>
  : T;

//   type FnInfo<T extends (...args: any) => any> = {
//     fn: T;
//     fnParams: Parameters<T>;
//     fnRetType: FnType<T>;
//   };

//   type Query<Q extends Queries, F extends (...args: any) => any> = {
//     queryKey: [Q];
//     fnData: FnInfo<F>;
//   };

export type QueryLoadingState = null | "" | "loading" | "saved";

function useEvercent() {
  const { user } = useAuth0();

  const { mutate: saveNewUserDetails } = useSQLMutation(
    "update-user-details",
    updateUserDetails,
    "get-all-evercent-data",
    false,
    updateCachedUserData
  );

  const { mutate: updateMonthsAhead } = useSQLMutation(
    "update-months-ahead",
    updateMonthsAheadTarget,
    "get-all-evercent-data",
    false,
    updateCachedUserData
  );

  const { mutate: updateCategories, data: newUpdatedCategories } =
    useSQLMutation(
      "update-categories",
      updateCategoryData,
      "get-all-evercent-data",
      false,
      updateCachedCategories
    );

  const { mutate: changeBudget, data: changeBudgetData } = useSQLMutation(
    "switch-budget",
    switchBudget
  );

  const { mutate: updateBudgetCategory } = useSQLMutation(
    "update-budget-category-amount",
    updateBudgetCategoryAmount
  );

  const { mutate: connect } = useSQLMutation("connect-to-ynab", connectToYNAB);

  const { data: evercentData, isLoading } = useSQLQuery(
    "get-all-evercent-data",
    getAllEvercentData(user?.email),
    !!user?.email
  );

  // log("About to return evercent data", evercentData);

  return {
    isLoading,
    ...(evercentData as EvercentData),

    updateUserDetails: saveNewUserDetails,
    updateMonthsAhead,
    updateCategories,
    newUpdatedCategories,
    changeBudget,
    changeBudgetData,

    connectToYNAB: connect,
    updateBudgetCategoryAmount: updateBudgetCategory,
  };
}

export default useEvercent;
