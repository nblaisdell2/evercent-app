import { getAPIResponse } from "../utils/api";

export type AutoRun = {
  runID: string;
  runTime: string;
  isLocked: boolean;
  categoryGroups: AutoRunCategoryGroup[];
};

export type AutoRunCategoryGroup = {
  groupID: string;
  groupName: string;
  categories: AutoRunCategory[];
};

export type AutoRunCategory = {
  categoryGUID: string;
  categoryID: string;
  categoryName: string;
  categoryAmount: number;
  categoryExtraAmount: number;
  categoryAdjustedAmount: number;
  categoryAdjustedAmountPerPaycheck: number;
  postingMonths: AutoRunCategoryMonth[];
};

export type AutoRunCategoryMonth = {
  postingMonth: string;
  included: boolean;
  amountToPost: number;
  amountPosted?: number;
  oldAmountBudgeted?: number;
  newAmountBudgeted?: number;
};

type ToggledCategory = {
  categoryGUID: string;
  postingMonth: string;
};

export const saveAutoRunDetails =
  (
    userID: string,
    budgetID: string,
    runTime: string,
    toggledCategories: ToggledCategory[]
  ) =>
  async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "POST",
      url: "/autoRun",
      params: {
        UserID: userID,
        BudgetID: budgetID,
        RunTime: runTime,
        ToggledCategories: JSON.stringify(toggledCategories),
      },
    });

    if (error) throw new Error(error);
    return data;
  };

export const cancelAutoRuns =
  (userID: string, budgetID: string) => async () => {
    const { data, error, headers } = await getAPIResponse({
      method: "POST",
      url: "/autoRun/cancel",
      params: {
        UserID: userID,
        BudgetID: budgetID,
      },
    });

    if (error) throw new Error(error);
    return data;
  };
