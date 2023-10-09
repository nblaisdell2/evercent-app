import { startOfMonth } from "date-fns";
import { getAPIResponse } from "../utils/api";
import { log } from "../utils/log";
import { find, sleep, sum } from "../utils/util";
import {
  CategoryGroup,
  PostingMonth,
  getAllCategories,
  isRegularExpense,
} from "./category";

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
  log("using API to post to budget", {
    UserID: userID,
    BudgetID: budgetID,
    CategoryID: categoryID,
    Month: month.substring(0, 10),
    NewBudgetedAmount: newBudgetedAmount,
  });
  const { data, error, headers } = await getAPIResponse({
    method: "POST",
    url: "/budget/updateCategoryAmount",
    params: {
      UserID: userID,
      BudgetID: budgetID,
      CategoryID: categoryID,
      Month: month.substring(0, 10),
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

export const getTotalAvailableInBudget = (budget: Budget) => {
  // Check to see if there's any money in the "To Be Assigned" section
  // from the first (current) budget month
  const tbb = budget.months[0].tbb;

  // Go through all the "available" amounts for the latest budget month
  const finalBM = budget.months[budget.months.length - 1];
  const available = finalBM.groups.reduce((prev, curr) => {
    return prev + curr.available;
  }, 0);

  // Then, after adding those values up, and it should be the total available
  // in the user's budget
  return tbb + available;
};

export const getTotalBudgetedByMonth = (
  budget: Budget,
  regularExpenses: CategoryGroup[]
): PostingMonth[] => {
  return budget.months.reduce((prev, curr, i) => {
    if (i == 0) return prev;

    let totalBudgeted = 0;
    const regCategories = getAllCategories(regularExpenses, false);
    for (let i = 0; i < regCategories.length; i++) {
      if (isRegularExpense(regCategories[i])) {
        const bc = getBudgetCategory(
          curr,
          regCategories[i].categoryGroupID,
          regCategories[i].categoryID
        );
        totalBudgeted += bc.budgeted;
      }
    }
    if (totalBudgeted <= 0) return prev;

    return [
      ...prev,
      {
        amount: totalBudgeted,
        month: curr.month,
        percent: 0,
      },
    ];
  }, [] as PostingMonth[]);
};

export const getTotalBudgetedByMonthRegular = (
  categoryGroups: CategoryGroup[],
  budget: Budget,
  groupID?: string,
  categoryID?: string
): PostingMonth[] => {
  return budget.months.reduce((prev, curr, i) => {
    if (i == 0) return prev;

    let totalBudgeted = 0;
    if (groupID == undefined && categoryID == undefined) {
      for (let i = 0; i < curr.groups.length; i++) {
        const budCats = curr.groups[i].categories;
        const evCats = find(
          categoryGroups,
          (cg) =>
            cg.groupID.toLowerCase() ==
            curr.groups[i].categoryGroupID.toLowerCase()
        )?.categories;

        if (!evCats) continue;

        for (let j = 0; j < budCats.length; j++) {
          const budCat = budCats[j];
          const evCat = find(
            evCats,
            (c) => c.categoryID.toLowerCase() == budCat.categoryID.toLowerCase()
          );

          if (!evCat) continue;
          if (isRegularExpense(evCat)) {
            totalBudgeted += budCat.budgeted;
          }
        }
      }

      totalBudgeted = sum(curr.groups, "budgeted");
    } else if (groupID != undefined && categoryID == undefined) {
      const thisGrp = find(
        curr.groups,
        (g) => g.categoryGroupID.toLowerCase() == groupID.toLowerCase()
      );
      const evCats = find(
        categoryGroups,
        (cg) =>
          cg.groupID.toLowerCase() == thisGrp.categoryGroupID.toLowerCase()
      )?.categories;

      for (let j = 0; j < thisGrp.categories.length; j++) {
        const budCat = thisGrp.categories[j];
        const evCat = find(
          evCats,
          (c) => c.categoryID.toLowerCase() == budCat.categoryID.toLowerCase()
        );
        if (!evCat) continue;

        if (isRegularExpense(evCat)) {
          totalBudgeted += budCat.budgeted;
        }
      }
    } else if (groupID && categoryID) {
      const thisGrp = find(
        curr.groups,
        (g) => g.categoryGroupID.toLowerCase() == groupID.toLowerCase()
      );
      const thisCat = find(
        thisGrp.categories,
        (c) => c.categoryID.toLowerCase() == categoryID.toLowerCase()
      );
      const evCats = find(
        categoryGroups,
        (cg) =>
          cg.groupID.toLowerCase() == thisGrp.categoryGroupID.toLowerCase()
      ).categories;
      const evCat = find(
        evCats,
        (c) => c.categoryID.toLowerCase() == thisCat.categoryID.toLowerCase()
      );

      if (isRegularExpense(evCat)) {
        totalBudgeted = thisCat.budgeted;
      }
    }

    if (totalBudgeted <= 0) return prev;

    return [
      ...prev,
      {
        amount: totalBudgeted,
        month: curr.month,
        percent: 0,
      },
    ];
  }, [] as PostingMonth[]);
};
