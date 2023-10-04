import { log } from "console";
import { getAPIResponse } from "../utils/api";
import { CategoryGroup, PostingMonth } from "./category";
import { PayFrequency, getAmountByPayFrequency } from "./userData";
import { parseISO } from "date-fns";

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

export const getExcludedCategoryMonths = (
  autoRun: AutoRun
): ToggledCategory[] => {
  let toggledCategories: ToggledCategory[] = [];

  const categories = getAutoRunCategories([autoRun]);
  for (let i = 0; i < categories.length; i++) {
    const months = categories[i].postingMonths;

    for (let j = 0; j < months.length; j++) {
      const month = months[j];

      if (!month.included) {
        toggledCategories.push({
          categoryGUID: categories[i].categoryGUID,
          postingMonth: month.postingMonth,
        });
      }
    }
  }

  return toggledCategories;
};

export const saveAutoRunDetails = async ({
  userID,
  budgetID,
  autoRuns,
}: {
  userID: string;
  budgetID: string;
  autoRuns: AutoRun[];
}) => {
  const runTime = autoRuns[0].runTime;
  const toggledCategories = getExcludedCategoryMonths(autoRuns[0]);

  // log("Saving auto run details", {
  //   runTime,
  //   toggledCategories,
  //   stringVer: JSON.stringify({ toggledCategories }),
  // });
  // log(JSON.stringify({ toggledCategories }));

  const { data, error, headers } = await getAPIResponse({
    method: "POST",
    url: "/autoRun",
    params: {
      UserID: userID,
      BudgetID: budgetID,
      RunTime: runTime,
      ToggledCategories: JSON.stringify({ toggledCategories }),
    },
  });

  if (error) throw new Error(error);
  return autoRuns;
};

export const cancelAutoRuns = async ({
  userID,
  budgetID,
}: {
  userID: string;
  budgetID: string;
}): Promise<AutoRun[]> => {
  const { data, error, headers } = await getAPIResponse({
    method: "POST",
    url: "/autoRun/cancel",
    params: {
      UserID: userID,
      BudgetID: budgetID,
    },
  });

  if (error) throw new Error(error);
  return [];
};

////////////////////////////////////////////
////////////////////////////////////////////
////////////////////////////////////////////

export const getAutoRunPostingMonths = (autoRun: AutoRun) => {
  const categories = getAutoRunCategories([autoRun]);
  const newMonths = new Map<string, PostingMonth>();
  let total = 0;
  for (let i = 0; i < categories.length; i++) {
    const months = categories[i].postingMonths;

    for (let j = 0; j < months.length; j++) {
      const currMonth = months[j];
      if (currMonth.included) {
        if (!newMonths.has(currMonth.postingMonth)) {
          newMonths.set(currMonth.postingMonth, {
            month: currMonth.postingMonth,
            amount: 0,
            percent: 0,
          });
        }

        total += currMonth.amountToPost;
        (newMonths.get(currMonth.postingMonth) as PostingMonth).amount +=
          currMonth.amountToPost;
      }
    }
  }

  let newPostingMonths: PostingMonth[] = [];
  newMonths.forEach((v, k) => {
    newPostingMonths.push({
      ...v,
      percent: v.amount / total,
    });
  });
  newPostingMonths.sort(
    (a, b) => parseISO(a.month).getTime() - parseISO(b.month).getTime()
  );

  return newPostingMonths;
};

export const getAutoRunCategoryTotal = (autoRunCategory: AutoRunCategory) => {
  return autoRunCategory.postingMonths.reduce((prev, curr) => {
    if (!curr.included) return prev;
    return prev + (curr.amountPosted ? curr.amountPosted : curr.amountToPost);
  }, 0);
};

export const getAutoRunCategoryGroupTotal = (
  autoRunCategoryGroup: AutoRunCategoryGroup
) => {
  return autoRunCategoryGroup.categories.reduce((prev, curr) => {
    return prev + getAutoRunCategoryTotal(curr);
  }, 0);
};
export const getAutoRunTotal = (autoRun: AutoRun) => {
  return autoRun.categoryGroups.reduce((prev, curr) => {
    return prev + getAutoRunCategoryGroupTotal(curr);
  }, 0);
};

export const generateAutoRunCategoryGroups = (
  categories: CategoryGroup[],
  payFreq: PayFrequency
) => {
  log("GENERATING from", categories);

  let returnGroups: AutoRunCategoryGroup[] = [];
  let returnCategories: AutoRunCategory[] = [];
  let returnPostingMonths: AutoRunCategoryMonth[] = [];

  returnGroups = [];
  for (let i = 0; i < categories.length; i++) {
    const currGroup = categories[i];
    returnCategories = [];

    for (let j = 0; j < currGroup.categories.length; j++) {
      const currCategory = currGroup.categories[j];
      returnPostingMonths = [];

      if (currCategory.adjustedAmount > 0) {
        for (let k = 0; k < currCategory.postingMonths.length; k++) {
          const currPM = currCategory.postingMonths[k];
          // const dbCats = .filter(
          //   (c) =>
          //     c.CategoryGUID?.toLowerCase() ==
          //       currCategory.guid.toLowerCase() &&
          //     c.PostingMonth &&
          //     new Date(currPM.month).toISOString() ==
          //       new Date(c.PostingMonth).toISOString()
          // );

          // const isIncluded = dbCats.at(0) ? dbCats[0].IsIncluded : true;

          returnPostingMonths.push({
            postingMonth: currPM.month,
            included: true, // isIncluded,
            amountToPost: currPM.amount,
          });
        }

        returnCategories.push({
          categoryGUID: currCategory.guid,
          categoryID: currCategory.categoryID,
          categoryName: currCategory.name,
          categoryAmount: currCategory.amount,
          categoryExtraAmount: currCategory.extraAmount,
          categoryAdjustedAmount: currCategory.adjustedAmount,
          categoryAdjustedAmountPerPaycheck: getAmountByPayFrequency(
            currCategory.adjustedAmountPlusExtra,
            payFreq
          ),
          postingMonths: returnPostingMonths,
        });
      }
    }

    if (returnCategories.length > 0) {
      returnGroups.push({
        groupID: currGroup.groupID,
        groupName: currGroup.groupName,
        categories: returnCategories,
      });
    }
  }

  return returnGroups;
};

export const getAutoRunCategories = (
  autoRuns: AutoRun[]
): AutoRunCategory[] => {
  if (!autoRuns[0]) return [];
  return autoRuns[0].categoryGroups.reduce((prev, curr) => {
    return [...prev, ...curr.categories];
  }, [] as AutoRunCategory[]);
};
