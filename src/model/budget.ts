import { startOfMonth } from "date-fns";
import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";
import { find } from "../utils/util";

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

export const connectToYNAB = async ({ userID }: { userID: string }) => {
  if (!userID) throw new Error("UserID required for connecting to YNAB");

  const { data, error, headers } = await getAPIResponse({
    method: "POST",
    url: "/budget/connect",
    params: {
      UserID: userID,
    },
  });

  if (error) throw new Error(error);

  window.location.href = data.url;
};

export const switchBudget = async ({
  userID,
  newBudgetID,
}: {
  userID: string;
  newBudgetID: string;
}) => {
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

export const updateBudgetCategoryAmount = async ({
  userID,
  budgetID,
  categoryID,
  month,
  newBudgetedAmount,
}: {
  userID: string;
  budgetID: string;
  categoryID: string;
  month: string;
  newBudgetedAmount: number;
}) => {
  const { data, error, headers } = await getAPIResponse({
    method: "POST",
    url: "/budget/updateCategoryAmount",
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

/////////////////

export const getBudgetCategories = (budget: Budget) => {
  return budget.months[0].groups.reduce((prev, curr) => {
    return [...prev, ...curr.categories];
  }, [] as BudgetMonthCategory[]);
};

export const getBudgetMonth = (months: BudgetMonth[], dt: Date) => {
  const dtNextDueDateMonth = startOfMonth(dt);
  const monthStr = dtNextDueDateMonth.toISOString().substring(0, 10);

  // Get BudgetMonthCategory from the same month of
  // this category's next due date
  return find(months, (bm) => bm.month == monthStr);
};

export const getBudgetCategory = (
  month: BudgetMonth,
  groupID: string,
  categoryID: string
) => {
  const budgetGroup = find(
    month.groups,
    (grp) => grp.categoryGroupID.toLowerCase() == groupID.toLowerCase()
  );
  const budgetCategory = find(
    budgetGroup.categories,
    (cat) => cat.categoryID.toLowerCase() == categoryID.toLowerCase()
  );
  return budgetCategory;
};
