import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";

export const FAKE_BUDGET_ID = "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEFFFFFF";

export type Budget = {
  id: string;
  name: string;
  months: BudgetMonth[];
};

export type BudgetMonth = {
  month: string;
  tbb: number;
  groups: BudgetMonthCategoryGroup[];
};

export type BudgetMonthCategoryGroup = {
  categoryGroupID: string;
  categoryGroupName: string;
  budgeted: number;
  activity: number;
  available: number;
  categories: BudgetMonthCategory[];
};

export type BudgetMonthCategory = {
  categoryGroupID: string;
  categoryGroupName: string;
  categoryID: string;
  name: string;
  budgeted: number;
  activity: number;
  available: number;
};

export const connectToYNAB = (userID: string) => async () => {
  if (!userID) throw new Error("UserID required for connecting to YNAB");

  const { data, error, headers } = await getAPIResponse({
    method: "POST",
    url: "/budget/connect",
    params: {
      UserID: userID,
    },
  });

  if (error) throw new Error(error);
  log("connect data", data);

  window.location.href = data.url;
};

export const getBudgetsList = (userID: string) => async () => {
  const { data, error, headers } = await getAPIResponse({
    method: "GET",
    url: "/budget/getBudgetsList",
    params: {
      UserID: userID,
    },
  });

  if (error) throw new Error(error);
  return data;
};

export const switchBudget =
  (userID: string, newBudgetID: string) => async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "POST",
      url: "/budget/switchBudget",
      params: {
        UserID: userID,
        NewBudgetID: newBudgetID,
      },
    });

    if (error) throw new Error(error);
    return data;
  };

export const updateBudgetCategoryAmount =
  (
    userID: string,
    budgetID: string,
    categoryID: string,
    month: string,
    newBudgetedAmount: number
  ) =>
  async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "POST",
      url: "/budget/switchBudget",
      params: {
        UserID: userID,
        BudgetID: budgetID,
        CategoryID: categoryID,
        Month: month,
        NewBudgetedAmount: newBudgetedAmount,
      },
    });

    if (error) throw new Error(error);
    return data;
  };
